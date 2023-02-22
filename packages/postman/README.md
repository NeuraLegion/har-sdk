# @har-sdk/postman

[![Maintainability](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/maintainability)](https://codeclimate.com/github/NeuraLegion/har-sdk/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/test_coverage)](https://codeclimate.com/github/NeuraLegion/har-sdk/test_coverage)
[![Build Status](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml/badge.svg?branch=master)](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml?query=branch%3Amaster+event%3Apush)
[![NPM Downloads](https://img.shields.io/npm/dw/@har-sdk/oas?label=NPM%20Downloads)](https://www.npmjs.com/package/@har-sdk/postman)

Transform your [Postman collection](https://blog.postman.com/postman-essentials-exploring-the-collection-format/) into a series of [HAR request objects](http://www.softwareishard.com/blog/har-12-spec/#request). This can be useful for a variety of purposes, such as analyzing network performance and debugging web applications.

- Reuse values in [Postman variables](https://learning.postman.com/docs/sending-requests/variables/) to resolve data.
- Automatically generates fake data using [the Dynamic variables](https://learning.postman.com/docs/writing-scripts/script-references/variables-list/).
- Compatible with [v2.0.0](https://schema.postman.com/collection/json/v2.0.0/draft-07/docs/index.html) and [v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html) collections.
- Simple and easy-to-use API.

With this library, you can easily generate requests with fake data to test your API using [AutoCannon](https://github.com/mcollina/autocannon#readme) or [DevTools](https://developer.chrome.com/blog/new-in-devtools-62/#har-imports).

## Setup

To install the library, run the following command:

```bash
$ npm i --save @har-sdk/postman
```

## Usage

To convert your collection, use the `postman2har` function as follows:

```js
import collection from './postman-collection.json' assert { type: 'json' };
import { postman2har } from '@har-sdk/postman';

const requests = await postman2har(collection);
console.log(requests);
```

If you want to pass additional data to resolve environment variables, you can do so by passing an options object as the second parameter:

```js
const requests = await postman2har(collection, {
  environment: { baseUrl: 'https://example.com' }
});
console.log(requests);
```

## License

Copyright © 2023 [Bright Security](https://brightsec.com/).

This project is licensed under the MIT License - see the [LICENSE file](https://github.com/NeuraLegion/har-sdk/blob/master/LICENSE) for details.
