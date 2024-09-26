const fetch = require('cross-fetch');

/**
 * Utility class for database operations
 */
class Util {
	/**
	 * Creates an increment operation
	 * @param {number} [value=1] - The value to increment by
	 * @returns {Object} The increment operation object
	 */
	increment(value = 1) {
		return { __op: "increment", value }
	}

	/**
	 * Creates an append operation
	 * @param {*} value - The value to append
	 * @returns {Object} The append operation object
	 */
	append(value) {
		return { __op: "append", value }
	}

	/**
	 * Creates a prepend operation
	 * @param {*} value - The value to prepend
	 * @returns {Object} The prepend operation object
	 */
	prepend(value) {
		return { __op: "prepend", value }
	}

	/**
	 * Creates a trim operation
	 * @returns {Object} The trim operation object
	 */
	trim() {
		return { __op: "trim" }
	}
}

/**
 * Base class for database operations
 */
class Base {
	/**
	 * @param {Contiguity} db - The Contiguity instance
	 * @param {string} name - The name of the base
	 */
	constructor(db, name) {
		this.db = db
		this.name = name
		this.util = new Util()
	}

	/**
	 * Performs a fetch operation
	 * @param {string} method - The HTTP method
	 * @param {string} path - The API path
	 * @param {Object} [body=null] - The request body
	 * @returns {Promise<Object>} The response data
	 * @private
	 */
	async _fetch(method, path, body = null) {
		const url = `${this.db.baseUrl}/${this.db.projectId}/${this.name}${path}`
		const options = {
			method,
			headers: {
				"x-api-key": this.db.apiKey,
				"Content-Type": "application/json",
			},
		}

		if (body) {
			options.body = JSON.stringify(body)
		}

		if (this.db.debug) {
			console.log(`Sending ${method} request to: ${url}`)
		}

		try {
			const response = await fetch(url, options)
			if (!response.ok) {
				if (response.status === 404) {
					return undefined
				}
				const errorBody = await response.text()
				console.error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
				return undefined
			}
			return response.json()
		} catch (error) {
			if (this.db.debug) {
				console.error(`Request failed: ${error.message}`)
			}
			return undefined
		}
	}

	/**
	 * Puts one or more items in the database
	 * @param {Object|Object[]} items - The item or array of items to put
	 * @param {string} [key=null] - The key for the item. If provided, it will be applied only if a single item is given.
	 * For multiple items, keys must be included in each item object.
	 * @param {Object} [options] - Additional options for the put operation
	 * @param {number} [options.expireIn] - The number of seconds after which the item(s) should expire
	 * @param {Date|string} [options.expireAt] - The specific date and time when the item(s) should expire
	 * @returns {Promise<Object>} The response data
	 */
	async put(items, key = null, options = {}) {
		const path = `/items`
		let itemsArray

		if (Array.isArray(items)) {
			itemsArray = items
		} else {
			itemsArray = [key ? { ...items, key } : items]
		}

		const requestBody = { items: itemsArray }

		if (options.expireIn) {
			requestBody.expireIn = options.expireIn
		}
		if (options.expireAt) {
			requestBody.expireAt = options.expireAt instanceof Date ? options.expireAt.toISOString() : options.expireAt
		}

		return this._fetch("PUT", path, requestBody)
	}

    
	/**
	 * Gets an item from the database
	 * @param {string} key - The key of the item to get
	 * @returns {Promise<Object>} The response data
	 */
	async get(key) {
		return this._fetch("GET", `/items/${key}`)
	}

	/**
	 * Deletes an item from the database
	 * @param {string} key - The key of the item to delete
	 * @returns {Promise<Object>} The response data
	 */
	async delete(key) {
		return this._fetch("DELETE", `/items/${key}`)
	}

	/**
	 * Updates an item in the database
	 * @param {Object} updates - The updates to apply
	 * @param {string} key - The key of the item to update
	 * @param {Object} [options] - Additional options for the update operation
	 * @param {number} [options.expireIn] - The number of seconds after which the item should expire
	 * @param {Date|string} [options.expireAt] - The specific date and time when the item should expire
	 * @returns {Promise<Object>} The response data
	 */
	async update(updates, key, options = {}) {
		const processedUpdates = {}
		for (const [field, value] of Object.entries(updates)) {
			if (value && typeof value === "object" && value.__op) {
				processedUpdates[field] = value
			} else {
				processedUpdates[field] = { __op: "set", value }
			}
		}

		const requestBody = { updates: processedUpdates }

		if (options.expireIn) {
			requestBody.expireIn = options.expireIn
		}
		if (options.expireAt) {
			requestBody.expireAt = options.expireAt instanceof Date
				? options.expireAt.toISOString()
				: options.expireAt
		}

		return this._fetch("PATCH", `/items/${key}`, requestBody)
	}
    
	/**
	 * Queries the database
	 * @param {Object} query - The query object to filter items
	 * @param {Object} [options] - Additional options for the query
	 * @param {number} [options.limit] - The maximum number of items to return
	 * @param {string} [options.last] - The last evaluated key for pagination
	 * @returns {Promise<Object>} The response data containing items, last evaluated key, and count
	 * @returns {Array} response.items - The array of items matching the query
	 * @returns {string|undefined} response.last - The last evaluated key for pagination, if applicable
	 * @returns {number} response.count - The total count of items matching the query
	 */
	async fetch(query, options = {}) {
		const { limit, last } = options

		const queryParams = {
			query: query || undefined,
			limit: limit || undefined,
			last: last || undefined,
		}

		if (this.db.debug) {
			console.log("Fetch params sent to server:", JSON.stringify(queryParams, null, 2))
		}

		const response = await this._fetch("POST", `/query`, queryParams)

		return {
			items: response.items,
			last: response.last,
			count: response.count,
		}
	}
}

/**
 * Main Contiguity class
 */
class Contiguity {
	/**
	 * @param {string} apiKey - The API key
	 * @param {string} projectId - The project ID
	 * @param {string} [baseUrl="https://api.base.contiguity.co/v1"] - The base URL for the API
	 * @param {boolean} [debug=false] - Whether to enable debug logging
	 */
	constructor(apiKey, projectId, baseUrl = "https://api.base.contiguity.co/v1", debug = false) {
		this.apiKey = apiKey
		this.projectId = projectId
		this.baseUrl = baseUrl
		this.debug = debug
	}

	/**
	 * Creates a new Base instance
	 * @param {string} name - The name of the base
	 * @returns {Base} A new Base instance
	 */
	Base(name) {
		return new Base(this, name)
	}
}

module.exports = {
	/**
	 * Creates a new Contiguity instance
	 * @param {string} apiKey - The API key
	 * @param {string} projectId - The project ID
	 * @param {string} [baseUrl] - The base URL for the API
	 * @param {boolean} [debug=false] - Whether to enable debug logging
	 * @returns {Contiguity} A new Contiguity instance
	 */
	db: (apiKey, projectId, baseUrl, debug = false) => new Contiguity(apiKey, projectId, baseUrl, debug),
}
