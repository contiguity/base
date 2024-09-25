const fetch = require("isomorphic-unfetch")

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
	 * @returns {Promise<Object>} The response data
	 */
	async put(items, key = null) {
		const path = `/items`;
		let itemsArray;

		if (Array.isArray(items)) {
			itemsArray = items.map(item => key ? { ...item, key } : item);
		} else {
			itemsArray = [key ? { ...items, key } : items];
		}

		return this._fetch("PUT", path, { items: itemsArray });
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
	 * @returns {Promise<Object>} The response data
	 */
	async update(updates, key) {
		const processedUpdates = {}
		for (const [field, value] of Object.entries(updates)) {
			if (value && typeof value === "object" && value.__op) {
				processedUpdates[field] = value
			} else {
				processedUpdates[field] = { __op: "set", value }
			}
		}
		return this._fetch("PATCH", `/items/${key}`, { updates: processedUpdates })
	}

	/**
	 * Queries the database
	 * @param {Object} queryParams - The query parameters
	 * @returns {Promise<Object>} The response data
	 */
	async query(queryParams) {
		if (this.db.debug) {
			console.log("Query params sent to server:", JSON.stringify(queryParams, null, 2))
		}
		return this._fetch("POST", "/query", queryParams)
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
