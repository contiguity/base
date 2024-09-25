<div align="center">
	<img src="https://github.com/contiguity/base/blob/main/examples/migrate-come-to-darkside-look.png" alt="Contiguity"/>
	<br>
    <h1>It's never been easier to migrate</h1>
	<p>Switch from Deta to Contiguity in less than 5 minutes, changing almost none of your code.</p>
	<br>
	<br>
</div>

## Using Deta 🟣

To use Deta, you would first import and initialize the Deta SDK:

```js
// Import Deta
const { Deta } = require('deta');
const deta = Deta(data_key);

// Define your Base (collection)
const simpleDB = deta.Base('simple_db');
```

## Using Contiguity 📊

To switch to Contiguity, install the SDK via NPM:

```shell
$ npm install @contiguity/base
```

You can then import and initialize Contiguity using either CommonJS or ES6 modules.

Using CommonJS:
```js
const contiguity = require('@contiguity/base');
const db = contiguity.db("your-api-key", "your-project-id");

// Define your Base (collection)
const simpleDB = db.Base("simple_db");
```

Using ES6 modules:
```js
import contiguity from '@contiguity/base';
const db = contiguity.db("your-api-key", "your-project-id");

// Define your Base (collection)
const simpleDB = db.Base("simple_db");
```

---

## Before/After 👀

Here's how to switch from Deta to Contiguity, with minimal changes to your code:

```js
// Using Deta:
// const { Deta } = require('deta'); // import Deta
// const deta = Deta(data_key);
// const simpleDB = deta.Base('simple_db');

// Using Contiguity:
const contiguity = require('@contiguity/base');  // or: import contiguity from '@contiguity/base';
const db = contiguity.db("your-api-key", "your-project-id");
const simpleDB = db.Base("simple_db");
```

and, now, you'll say, "but my Base calls!" and "I incremented and queried and stored data!" -- well, guess what, we matched it all. No changes required. Don't believe us? Check out [this old email open tracking API](https://github.com/contiguity/base/tree/main/examples/Migrated%20App%20Demo) we had, that we switched from Deta to Contiguity.