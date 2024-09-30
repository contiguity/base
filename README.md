<p align='center'><img src="https://contiguity.co/assets/icon-black.png" height="150px"/></p>
<h1 align='center'>@contiguity/base</h1>

<p align='center'>
    <img display="inline-block" src="https://img.shields.io/npm/v/@contiguity/base?style=for-the-badge" /> <img display="inline-block" src="https://img.shields.io/bundlephobia/minzip/@contiguity/base?style=for-the-badge" /> <img display="inline-block" src="https://img.shields.io/badge/Made%20with-JavaScript-yellow?style=for-the-badge" />
</p>
<p align='center'>Contiguity's official JavaScript SDK for Contiguity Base</p>

## Installation 🏗 & Setup 🛠
You can install the SDK using NPM. 
```shell
$ npm install @contiguity/base
```

Then, import & initialize it like this:

Using CommonJS (require):
```js
const contiguity = require('@contiguity/base')
const db = contiguity.db("your-api-key", "your-project-id")
```

Using ES6 modules (import):
```js
import contiguity from '@contiguity/base'
const db = contiguity.db("your-api-key", "your-project-id")
```

You can get an API key by fetching it in the [dashboard](https://base.contiguity.co), and a project ID is given to you when creating a project.

## <img src="https://avatars.githubusercontent.com/u/47275976?s=280&v=4" alt="Deta Logo" style="vertical-align: middle;" height="30"> For those moving from Deta Space <img src="https://avatars.githubusercontent.com/u/47275976?s=280&v=4" alt="Deta Logo" style="vertical-align: middle;" height="30">
Contiguity Base is a one-to-one replacement for the old Deta Base API, Deta Base JavaScript SDK, Deta Base Python SDK, and Deta Base Go SDK. The only thing that has changed is initialization. 

Instead of ```const deta = Deta(projectKey)```, you'll use ```const db = contiguity.db(apiKey, projectId)```

The rest stays the same, because at Contiguity, we think it's crazy for a cloud provider to give you 45 days to move dozens of apps from their proprietary database.

If you're transitioning from Deta Space to Contiguity, welcome! 

## Creating your first "base" 📊

To start working with a base, you can create a Base instance:

```js
const myBase = db.Base("my-awesome-base")
```

Now you're ready to perform some cool database operations!

## Putting data into your base 📥

To add an item to your base, use the `put` method:

```js
const item = {
    name: "Contiguity",
    is_awesome: true,
    coolness_level: 9000
}

await myBase.put(item)
```

You can also specify a key for your item:

```js
await myBase.put(item, "unique-key-1")
```

You can set an expiration time for the item:

```js
// Expire in 3600 seconds (1 hour)
await myBase.put(item, "unique-key-1", { expireIn: 3600 })

// Expire at a specific date/time
await myBase.put(item, "unique-key-1", { expireAt: "2023-12-31T23:59:59Z" })
```

## Batch putting 📦
Need to add multiple items at once? No problem! Just pass an array of items:

```js
const items = [
    { name: "Item 1", value: 100 },
    { name: "Item 2", value: 200 },
    { name: "Item 3", value: 300, key: "some-unique-key" }
]

await myBase.putMany(items)
```

## Getting data from your base 🔍

To retrieve an item, use the `get` method:

```js
const myItem = await myBase.get("unique-key-1")
console.log(myItem.name) // Outputs: Contiguity
```

## Updating data in your base 🔄

Need to update an item? Use the `update` method:

```js
await myBase.update({ coolness_level: 9001 }, "unique-key-1")
```

You can also use utility operations for updating:

```js
// Increment a value
await myBase.update({ views: myBase.util.increment(1) }, "blog-post-1")

// Append to an array
await myBase.update({ tags: myBase.util.append("awesome") }, "product-1")

// Prepend to an array
await myBase.update({ recent_visitors: myBase.util.prepend("Alice") }, "website-stats")

// Trim a string
await myBase.update({ description: myBase.util.trim() }, "user-bio")
```

## Deleting data from your base 🗑️

To remove an item, use the `delete` method:

```js
await myBase.delete("unique-key-1")
```

## Querying (fetching) your base 🕵️‍♀️

You can perform complex queries using the `fetch` method:

```js
const results = await myBase.fetch({ 
  "is_awesome": true, 
  "profile.name?contains": "John" 
});

console.log(results.items); // Array of matching items
console.log(results.count); // Total count of matching items
console.log(results.last);  // Last evaluated key for pagination
```

### Query Operators

Contiguity Base supports various query operators. Here are some examples:

- **Equal**: `{ "age": 22 }`
- **Not Equal**: `{ "age?ne": 22 }`
- **Less Than**: `{ "age?lt": 22 }`
- **Greater Than**: `{ "age?gt": 22 }`
- **Less Than or Equal**: `{ "age?lte": 22 }`
- **Greater Than or Equal**: `{ "age?gte": 22 }`
- **Prefix**: `{ "name?pfx": "Jo" }`
- **Range**: `{ "age?r": [18, 30] }`
- **Contains**: `{ "tags?contains": "javascript" }`
- **Not Contains**: `{ "tags?not_contains": "python" }`

For more detailed information on query operators, please refer to our documentation.

## Pagination

When fetching large datasets, you can use pagination:

```js
let lastKey = undefined;
do {
  const results = await myBase.fetch(query, { limit: 1000, last: lastKey });
  // Process results.items
  lastKey = results.last;
} while (lastKey);
```

## Debug mode 🐛

If you enable debug mode during initialization, the SDK will log detailed information about your requests. This can be super helpful for troubleshooting!

```js
const db = contiguity.db("your-api-key", "your-project-id", true)
```

## Error handling 🚨

The SDK won't throw errors when things don't go as planned. Instead, it will return `undefined` in most cases, like if you attempt to GET a non-existent key. However, it is always recommended to put database calls in a try/catch block:

```js
try {
    const item = await myBase.get("non-existent-key")
    if (item === undefined) {
        console.log("Item not found")
    } else {
        console.log("Item:", item)
    }
} catch (error) {
    console.error("Oops!", error.message)
}
```

## Roadmap 🚦
- Support for more complex query operations
- Batch operations for deleting multiple items
- "Deta Drive" support (file storage)
- And many more exciting features!

For more detailed information and advanced usage, please refer to our full documentation.