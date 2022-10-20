# @har-sdk/openapi-sampler

Tool for generation samples based on OpenAPI payload/response schema

## Features

- deterministic (given a particular input, will always produce the same output)
- Supports `allOf`
- Supports `additionalProperties`
- Uses `default`, `const`, `enum` and `examples` where possible
- Full array support: supports `minItems`, and tuples (`items` as an array)
- Supports `minLength`, `maxLength`, `min`, `max`, `exclusiveMinimum`, `exclusiveMaximum`
- Supports the next `string` formats:
  - email
  - password
  - date-time
  - date
  - ipv4
  - ipv6
  - hostname
  - uri
- Infers schema type automatically following same rules as [json-schema-faker](https://www.npmjs.com/package/json-schema-faker#inferred-types)
- Support for `$ref` resolving

## Installation

Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm)

```bash
npm i --save @har-sdk/openapi-sampler
```

or using [yarn](https://yarnpkg.com)

```bash
yarn add @har-sdk/openapi-sampler
```

Then require it in your code:

```ts
import { sample } from '@har-sdk/openapi-sampler';
```

## Usage

#### `sample(schema, [options], [spec])`

- **schema** (_required_) - `object`
  A [OpenAPI Schema Object](http://swagger.io/specification/#schemaObject)
- **options** (_optional_) - `object`
  Available options:
  - **skipNonRequired** - `boolean`
    Don't include non-required object properties not specified in [`required` property of the schema object](https://swagger.io/docs/specification/data-models/data-types/#required)
  - **skipReadOnly** - `boolean`
    Don't include `readOnly` object properties
  - **skipWriteOnly** - `boolean`
    Don't include `writeOnly` object properties
  - **quiet** - `boolean`
    Don't log console warning messages
  - **maxSampleDepth** - `number`
    Specifies the maximum safe depth of the sampling stack.
- **spec** - whole specification where the schema is taken from. Required only when schema may contain `$ref`. **spec** must not contain any external references

## Example

```ts
import { sample } from '@har-sdk/openapi-sampler';

sample(
  {
    type: 'object',
    properties: {
      a: { type: 'integer', minimum: 10 },
      b: { type: 'string', format: 'password', minLength: 10 },
      c: { type: 'boolean', readOnly: true }
    }
  },
  { skipReadOnly: true }
);
// { a: 10, b: 'pa$$word_q' }
```
