# @har-sdk/types

**THIS PACKAGE HAS BEEN DEPRECATED. THE DEVELOPMENT HAS MOVED TO A [@HAR-SDK/CORE](https://github.com/NeuraLegion/har-sdk/tree/master/packages/oas#readme) PACKAGE**

Types for OpenAPI and Postman documents

## Setup

```bash
npm i --save @har-sdk/types
```

## Usage

```ts
import { { OpenAPI, OpenAPIV2, OpenAPIV3, Postman, Collection } } from '@har-sdk/types';

function process(doc: Collection.Document) {};

function processOpenAPI(doc: OpenAPI.Document) {};
function processOpenAPIV2(doc: OpenAPIV2.Document) {};
function processOPENAPIV3(doc: OpenAPIV3.Document) {};

function processPostman(doc: Postman.Document) {};
```

## API

`Collection` - describes all types (OpenAPI and Postman)

`OpenAPI` - describes OpenAPI types (OpenAPIV2, OpenAPIV3)

`isOASV2(doc: Collection.Document)` - Checks if OpenAPIV2

`isOASV3(doc: Collection.Document)` - Checks if OpenAPIV3

`isPostman(doc: Collection.Document)` - Checks if Postman
