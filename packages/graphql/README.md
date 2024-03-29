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

## License

Copyright © 2024 [Bright Security](https://brightsec.com/).

This project is licensed under the MIT License - see the [LICENSE file](https://github.com/NeuraLegion/har-sdk/blob/master/LICENSE) for details.
