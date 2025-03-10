# @har-sdk/openapi-sampler

[![Maintainability](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/maintainability)](https://codeclimate.com/github/NeuraLegion/har-sdk/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4acaec95c82465cb2c3d/test_coverage)](https://codeclimate.com/github/NeuraLegion/har-sdk/test_coverage)
[![Build Status](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml/badge.svg?branch=master)](https://github.com/NeuraLegion/har-sdk/actions/workflows/auto-build.yml?query=branch%3Amaster+event%3Apush)
[![NPM Downloads](https://img.shields.io/npm/dw/@har-sdk/openapi-sampler?label=NPM%20Downloads)](https://www.npmjs.com/package/@har-sdk/openapi-sampler)

This is a tool that generates samples based on OpenAPI payload/response schema.

- Supports a wide range of schema types and formats, including `allOf`, `additionalProperties`, and common string formats such as `email`, `password`, `date-time`, and more.
- Infers schema type automatically following the same rules as [json-schema-faker](https://www.npmjs.com/package/json-schema-faker#inferred-types).
- Supports `$ref` resolving.
- Produces deterministic and predictable output for a given input.
- Makes it easier and faster to generate sample data for OpenAPI schemas.
- Reduces errors and increases code quality by ensuring that generated samples follow the defined schema.

Using the `@har-sdk/openapi-sampler` package can save you a lot of time when you need to generate sample data for your OpenAPI schemas. With just a few lines of code, you can create realistic data objects that you can use for testing or documentation purposes.

## Installation

To install the package using npm, run the following command:

```bash
$ npm i --save @har-sdk/openapi-sampler
```

If you prefer using yarn, you can use the following command instead:

```bash
$ yarn add @har-sdk/openapi-sampler
```

## Usage

After installing, you can import the package in your code using the following import statement:

```js
import { sample } from '@har-sdk/openapi-sampler';
```

The `sample()` function is the main API provided by the package, and it takes three parameters:

| Option  | Description                                                                                                                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schema  | [OpenAPI Schema Object](http://swagger.io/specification/#schemaObject) that specifies the structure of the data you want to generate samples for.                                                               |
| options | Provides additional options for the sampler, such as skipping non-required properties, read-only properties, or write-only properties. You can find a full list of available options in the code example below. |
| spec    | Entire OpenAPI specification that the schema is taken from. This parameter is only required if the schema contains `$ref` references to external schemas.                                                       |

Here's an example of how to use the `sample()` function:

```js
import { sample } from '@har-sdk/openapi-sampler';

sample({
  type: 'object',
  properties: {
    a: { type: 'integer', minimum: 10 },
    b: { type: 'string', format: 'password', minLength: 10 },
    c: { type: 'boolean' }
  }
});
// { a: 10, b: 'pa$$word_q', c: true }
```

In this example, it is generating a sample data object based on a schema that contains three properties (`a`, `b`, and `c`).

Note, when `$ref` is used, the `spec` object must be provided so that the sampler can resolve the reference:

```js
import { sample } from '@har-sdk/openapi-sampler';

const spec = {
  // ...
  components: {
    schemas: {
      Pet: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            format: 'int64'
          },
          name: {
            type: 'string'
          }
        }
      }
    }
  }
};

sample({ $ref: '#/components/schemas/Pet' }, {}, spec);
// { id: 42, name: 'lorem' }
```

By default, the sampler generates values for all properties defined in a schema, regardless of whether they are required or not. If you want to exclude non-required object properties, you can use the `skipNonRequired` option as follows:

```js
sample(
  {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string' }
    },
    required: ['b']
  },
  { skipNonRequired: true }
);
// { b: 'lorem' }
```

By default, all properties, including those marked as read or write-only, are included in the generated sample. However, if you want to exclude `readOnly` or `writeOnly` properties, you can use the `skipReadOnly` or `skipWriteOnly` options, respectively, as shown below:

```js
sample(
  {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string', readOnly: true }
    }
  },
  { skipReadOnly: true }
);
// { a: 'lorem' }
```

Note, the library recursively generates the entire sample object tree up to a maximum depth of 2 level to prevent infinite recursion. If you want to increase or decrease this maximum depth, you can use the `maxSampleDepth` option as follows:

```js
sample(schema, { maxSampleDepth: 20 });
```

Also, the library logs console warning messages when it encounters an unsupported schema. If you want to suppress these warning messages, you can use the quiet option as follows:

```js
sample(schema, { quiet: true });
```

When the schema comes from the specification which does not allow the `example` node to exist e.g. OAS 2.0 parameter definition, some vendors may provide such schema example value in OAS vendor extension nodes namely `x-example` or `x-examples`. If you want to include such kind of example values into the output, you can use the `includeVendorExamples` as shown below:

```js
sample(
  {
    'type': 'string',
    'x-example': 'some_value'
  },
  { includeVendorExamples: true }
);
// some_value
```

## License

Copyright © 2023 [Bright Security](https://brightsec.com/).

This project is licensed under the MIT License - see the [LICENSE file](https://github.com/NeuraLegion/har-sdk/blob/master/LICENSE) for details.
