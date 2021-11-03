# @har-sdk/validator

A validator for OpenAPI and Postman documents.

## Setup

```bash
npm i --save @har-sdk/validator
```

## Usage

```ts
import { DefaultValidator, Validator } from '@har-sdk/validator';
import githubSwagger from './github_swagger.json';

const apiDoc = {
  openapi: '2.0',
  host: 'http://localhost:3000',
  info: {
    title: 'Some valid API document',
    version: '1.0.0'
  },
  paths: {}
};

const result = await validator.validate(apiDoc);
// array of ErrorObject
```

See [Error Object](https://ajv.js.org/api.html#error-objects)
