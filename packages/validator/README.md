# @har-sdk/validator

A validator for HAR v1.2 Spec, OpenAPI and Postman documents.

## Setup

```bash
npm i --save @har-sdk/validator
```

## Usage

```ts
import { OpenAPIV2 } from '@har-sdk/types';
import { OASValidator, ErrorHumanizer } from '@har-sdk/validator';

const apiDoc = {
  swagger: '2.0',
  host: 'localhost',
  info: {
    title: 'Some valid API document'
  },
  paths: {}
} as OpenAPIV2.Document;

const errors = await new OASValidator().verify(apiDoc as any);
console.log(errors);
// [
//   {
//     "instancePath": "/info",
//     "schemaPath": "#/required",
//     "keyword": "required",
//     "params": {
//       "missingProperty": "version"
//     },
//     "message": "must have required property 'version'"
//   }
// ]

const humanizedErrors = await new ErrorHumanizer().humanizeErrors(errors);
console.log(humanizedErrors);
// [
//   {
//     "originalError": {
//       "instancePath": "/info",
//       "schemaPath": "#/required",
//       "keyword": "required",
//       "params": {
//         "missingProperty": "version"
//       },
//       "message": "must have required property 'version'"
//     },
//     "message": "the value at /info is missing the required field `version`",
//     "messageParts": [
//       {
//         "text": "the value at /info",
//         "jsonPointer": "/info"
//       },
//       {
//         "text": "is missing the required field `version`"
//       }
//     ]
//   }
// ]
```

See [Error Object](https://ajv.js.org/api.html#error-objects)
