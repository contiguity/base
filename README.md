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
Contiguity Base is a one to one replacement for the old Deta Base API, Deta Base JavaScript SDK, Deta Base Python SDK, and Deta Base Go SDK. The only thing that has changed is initialization. 

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

## Batch putting 📦
Need to add multiple items at once? No problem! Just pass an array of items:

```js
const items = [
    { name: "Item 1", value: 100 },
    { name: "Item 2", value: 200 },
    { name: "Item 3", value: 300, key: "some-unique-key" }
]

await myBase.put({ items: items })
```

## Inserting data into your base 🚀
To insert an item into your base, use the insert method. This is useful when you want to ensure you're not overwriting existing data:
```js
const newItem = {
    name: "New Product",
    price: 49.99
}

await myBase.insert(newItem, "product-1")
```

If an item with the same key already exists, the insert operation will fail, preventing accidental overwrites.

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

## Deleting data from your base 🗑️

To remove an item, use the `delete` method:

```js
await myBase.delete("unique-key-1")
```


## Querying (fetching) your base 🕵️‍♀️

You can perform complex queries using the `fetch` method like so:

```js
const results = await myBase.fetch({ 
  "is_awesome": true, 
  "profile.name?contains": "John" 
});
```

### Query Operators

#### Equal

```json
{
  "age": 22, 
  "name": "Sarah"
}
```

- **Hierarchical**  
```json
{
  "user.profile.age": 22, 
  "user.profile.name": "Sarah"
}
```

- **Array**  
```json
{
  "fav_numbers": [2, 4, 8]
}
```

- **Nested Object**  
```json
{
  "time": { 
    "day": "Tuesday", 
    "hour": "08:00"
  }
}
```

#### Not Equal

```json
{
  "user.profile.age?ne": 22
}
```

#### Less Than

```json
{
  "user.profile.age?lt": 22
}
```

#### Greater Than

```json
{
  "user.profile.age?gt": 22
}
```

#### Less Than or Equal

```json
{
  "user.profile.age?lte": 22
}
```

#### Greater Than or Equal

```json
{
  "user.profile.age?gte": 22
}
```

#### Prefix (String starts with)

```json
{
  "user.id?pfx": "afdk"
}
```

#### Range

```json
{
  "user.age?r": [22, 30]
}
```

#### Contains

- **String contains a substring**  
```json
{
  "user.email?contains": "@contiguity.co"
}
```

- **List contains an item**  
```json
{
  "user.places_lived_list?contains": "Miami"
}
```

#### Not Contains

- **String does not contain a substring**  
```json
{
  "user.email?not_contains": "@contiguity.co"
}
```

- **List does not contain an item**  
```json
{
  "user.places_lived_list?not_contains": "Miami"
}
```

## Utility operations 🛠️

Contiguity provides some cool utility operations for updating your data:

### Increment a value
```js
await myBase.update({ views: myBase.util.increment(1) }, "blog-post-1")
```

### Decrement a value
```js
await myBase.update({ days: myBase.util.increment(-1) }, "countdown")
```

### Append to an array
```js
await myBase.update({ tags: myBase.util.append("awesome") }, "product-1")
```

### Prepend to an array
```js
await myBase.update({ recent_visitors: myBase.util.prepend("Alice") }, "website-stats")
```

### Trim a string
```js
await myBase.update({ description: myBase.util.trim() }, "user-bio")
```
## Debug mode 🐛

If you enable debug mode during initialization, the SDK will log detailed information about your requests. This can be super helpful for troubleshooting!
```js
const db = contiguity.db("your-api-key", "your-project-id", null, true)
```

## Error handling 🚨

The SDK won't throw errors when things don't go as planned. Instead, it will return defined in most cases, like if you attempt to GET a non-existent key. However, it is always recommended to put database calls in a try/catch block:

```js
try {
    await myBase.get("non-existent-key")
} catch (error) {
    console.error("Oops!", error.message)
}
```

## Roadmap 🚦
- Support for more complex query operations
- Batch operations for deleting multiple items
- "Deta Drive" support (file storage)
- And many more exciting features!