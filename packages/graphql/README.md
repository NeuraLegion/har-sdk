# @har-sdk/graphql

[![Maintainability](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/maintainability)](https://codeclimate.com/github/NeuraLegion/har-sdk/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/test_coverage)](https://codeclimate.com/github/NeuraLegion/har-sdk/test_coverage)
[![Build Status](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml/badge.svg?branch=master)](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml?query=branch%3Amaster+event%3Apush)
[![NPM Downloads](https://img.shields.io/npm/dw/@har-sdk/graphql?label=NPM%20Downloads)](https://www.npmjs.com/package/@har-sdk/graphql)

Transform your [GraphQL introspection](https://spec.graphql.org/draft/#sec-Introspection) or [GraphQL schema collection](https://spec.graphql.org/draft) into a series of [HAR request objects](http://www.softwareishard.com/blog/har-12-spec/#request). This can be useful for a variety of purposes, such as analyzing network performance and debugging web applications.

- Automatically generates fake data for all parameters
- Simple and easy-to-use API.
- Supports variety of community adopted [custom SCALAR](https://spec.graphql.org/draft/#sec-Scalars.Custom-Scalars) types out of the box.
- Supports [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec).

With this library, you can easily generate requests with fake data to test your API using [AutoCannon](https://github.com/mcollina/autocannon#readme) or [DevTools](https://developer.chrome.com/blog/new-in-devtools-62/#har-imports).

## Setup

To install the library, run the following command:

```bash
$ npm i --save @har-sdk/graphql
```

# Usage

To convert your introspection, use the `graphql2har` function as follows:

```js
import introspection from './graphql-introspection.json' assert { type: 'json' };
import { graphql2har } from '@har-sdk/graphql';

const requests = await graphql2har({
  ...introspection,
  url: 'https://example.com/graphql'
});

console.log(requests);
```

If you want to skip some kind of operation layouts or limit the result HAR requests quantity, you can do this by passing an options object as the second parameter:

```js
import introspection from './graphql-introspection.json' assert { type: 'json' };
import { graphql2har } from '@har-sdk/graphql';

const requests = await graphql2har(
  {
    ...introspection,
    url: 'https://example.com/graphql'
  },
  {
    skipFileUploads: true,
    limit: 10
  }
);

console.log(requests);
```

Here is a table describing the options for the `graphql2har` function:

| Option                      | Description                                                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `skipInPlaceValues`         | If set to `true`, the function will not produce requests for operations having data provided as argument default values.                                                                                                                                                                   |
| `skipExternalizedVariables` | If set to `true`, the function will skip requests for operations having data injected as variables, the actual data values passed in `variables` node of operation payload.                                                                                                                |
| `skipFileUploads`           | If set to `true`, the function will not create `multipart/form-data` requests according to [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec).                                                                                       |
| `includeSimilarOperations`  | If set to `true`, the function will skip deduplocation of the equal operations which may occur when the operation has no argumnents.                                                                                                                                                       |
| `operationCostThreshold`    | This property can be used to manage the statement complexity via the threshold for the operation cost. Cost is claculation is primitive - each input argument or output selection field costs 1. When the overall operation complexity reaches the threshold the operation sampling stops. |
| `limit`                     | This property can be used to limit the number of HAR requests.                                                                                                                                                                                                                             |

## License

Copyright © 2024 [Bright Security](https://brightsec.com/).

This project is licensed under the MIT License - see the [LICENSE file](https://github.com/NeuraLegion/har-sdk/blob/master/LICENSE) for details.
