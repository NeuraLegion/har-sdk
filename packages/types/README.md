# @har-sdk/types

Types for OpenAPI and Postman documents

## Setup

```bash
npm i --save @har-sdk/types
```

## Usage

```ts
import { OpenAPIV2, isOASV2 } from '@har-sdk/types';

const apiDoc = {
  swagger: '2.0',
  host: 'localhost',
  info: {
    title: 'Some valid API document'
  },
  paths: {}
} as OpenAPIV2.Document;

isOASV2(apiDoc); // returns true
```
