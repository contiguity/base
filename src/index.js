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
			itemsArray = items.map(item => ({ ...item }))
		} else {
			itemsArray = [{ ...items, key }]
		}

		itemsArray.forEach(item => {
			if (options.expireIn || options.expireAt) {
				item.__expires = this.calculateExpires(options.expireIn, options.expireAt)
			}
		})

		return this._fetch("PUT", path, { items: itemsArray })
	}

    /**
	 * Inserts a single item into the database
	 * @param {Object} item - The item to insert
	 * @param {string} [key=null] - The key for the item
	 * @param {Object} [options] - Additional options for the insert operation
	 * @param {number} [options.expireIn] - The number of seconds after which the item should expire
	 * @param {Date|string} [options.expireAt] - The specific date and time when the item should expire
	 * @returns {Promise<Object>} The response data
	 */
	async insert(item, key = null, options = {}) {
		const path = `/items`
		const itemToInsert = { ...item }

		if (key) {
			itemToInsert.key = key
		}

		if (options.expireIn || options.expireAt) {
			itemToInsert.__expires = this.calculateExpires(options.expireIn, options.expireAt)
		}

		return this._fetch("POST", path, { item: itemToInsert })
	}

	calculateExpires(expireIn, expireAt) {
		if (expireAt) {
			return Math.floor(new Date(expireAt).getTime() / 1000)
		} else if (expireIn) {
			return Math.floor(Date.now() / 1000) + expireIn
		}
		return undefined
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
		const processedUpdates = {
			set: {},
			increment: {},
			append: {},
			prepend: {},
			delete: []
		}

		for (const [field, value] of Object.entries(updates)) {
			if (value && typeof value === "object" && value.__op) {
				switch (value.__op) {
					case "increment":
						processedUpdates.increment[field] = value.value
						break
					case "append":
						processedUpdates.append[field] = value.value
						break
					case "prepend":
						processedUpdates.prepend[field] = value.value
						break
					case "delete":
						processedUpdates.delete.push(field)
						break
					default:
						processedUpdates.set[field] = value.value
				}
			} else {
				processedUpdates.set[field] = value
			}
		}

		if (options.expireIn || options.expireAt) {
			processedUpdates.set.__expires = this.calculateExpires(options.expireIn, options.expireAt)
		}

		const requestBody = { updates: processedUpdates }

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

	/**
	 * Puts multiple items into the database
	 * @param {Object[]} items - An array of items to put into the database
	 * @throws {Error} If the input is not an array or is an empty array
	 * @returns {Promise<Object>} The response data from the put operation
	 */
	async putMany(items) {
		if (!Array.isArray(items) || items.length === 0) {
			throw new Error("putMany requires an array of items with at least one item");
		}
		return this.put(items);
	}
}

/**
 * Main Contiguity class
 */
class Contiguity {
	/**
	 * @param {string} apiKey - The API key
	 * @param {string} projectId - The project ID
	 * @param {boolean} [debug=false] - Whether to enable debug logging
	 */
	constructor(apiKey, projectId, debug = false) {
		this.apiKey = apiKey
		this.projectId = projectId
		this.baseUrl = "https://api.base.contiguity.co/v1"
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
	 * @param {boolean} [debug=false] - Whether to enable debug logging
	 * @returns {Contiguity} A new Contiguity instance
	 */
	db: (apiKey, projectId, debug = false) => new Contiguity(apiKey, projectId, debug),
}