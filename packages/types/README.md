# @har-sdk/types

**THIS PACKAGE HAS BEEN DEPRECATED. THE DEVELOPMENT HAS MOVED TO A [@HAR-SDK/CORE](https://github.com/NeuraLegion/har-sdk/tree/master/packages/oas#readme) PACKAGE**

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
