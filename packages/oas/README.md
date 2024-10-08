# @har-sdk/oas

[![Maintainability](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/maintainability)](https://codeclimate.com/github/NeuraLegion/har-sdk/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/test_coverage)](https://codeclimate.com/github/NeuraLegion/har-sdk/test_coverage)
[![Build Status](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml/badge.svg?branch=master)](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml?query=branch%3Amaster+event%3Apush)
[![NPM Downloads](https://img.shields.io/npm/dw/@har-sdk/oas?label=NPM%20Downloads)](https://www.npmjs.com/package/@har-sdk/oas)

Transform your [Swagger](https://swagger.io/specification/v2/)/[OAS](http://swagger.io/specification/) spec files into a series of [HAR request objects](http://www.softwareishard.com/blog/har-12-spec/#request).

- Automatically generates fake data for all parameters
- Compatible with Swagger and OAS specifications
- Simple and easy-to-use API

With this library, you can easily generate requests with fake data to test your API using [AutoCannon](https://github.com/mcollina/autocannon#readme) or [DevTools](https://developer.chrome.com/blog/new-in-devtools-62/#har-imports).

## Setup

To install the library, run the following command:

```bash
$ npm i --save @har-sdk/oas
```

## Usage

To covert your specification, use the `oas2har` function as follows:

```js
import schema from './swagger.json' assert { type: 'json' };
import { oas2har } from '@har-sdk/oas';

const requests = await oas2har(schema);
console.log(requests);
```

YAML files can also be loaded using [js-yaml](https://github.com/nodeca/js-yaml), as shown below:

```js
import { oas2har } from '@har-sdk/oas';
import { readFile } from 'node:fs/promises';
import yaml from 'js-yaml';

const content = yaml.load(await readFile('./swagger.yaml', 'utf-8'));
const requests = await oas2har(content);
console.log(requests);
```

If you have your specification hosted remotely, you can use a library like [axios](https://github.com/axios/axios) to fetch it and then convert it to a HAR. Here's an example:

```js
import axios from 'axios';
import { oas2har } from '@har-sdk/oas';

const url = 'https://example.com/swagger.json';
const response = await axios.get(url);
const requests = await oas2har(response.data);
console.log(requests);
```

Some specifications may incorporate example values for parameters provided in vendor extension fields, to include such examples in output use the `oas2har` function as follows:

```js
import schema from './swagger.json' assert { type: 'json' };
import { oas2har } from '@har-sdk/oas';

const requests = await oas2har(schema, { includeVendorExamples: true });
console.log(requests);
```

Notice the `includeVendorExamples` option affects Swagger specifications only.

Some specifications may have configuration for `Accept` header value in request parameters section. The automatically inferred `Accept` header values may be skipped, to skip these inferred values in output use the `oas2har` function as follows:

```js
import schema from './swagger.json' assert { type: 'json' };
import { oas2har } from '@har-sdk/oas';

const requests = await oas2har(schema, { skipAcceptHeaderInference: true });
console.log(requests);
```

## License

Copyright © 2023 [Bright Security](https://brightsec.com/).

This project is licensed under the MIT License - see the [LICENSE file](https://github.com/NeuraLegion/har-sdk/blob/master/LICENSE) for details.
