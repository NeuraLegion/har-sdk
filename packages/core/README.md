# @har-sdk/core

The base package can be used to import specification files (i.e. HAR, OAS and Postman Collection) and detect their type.

## Setup

```bash
npm i --save @har-sdk/core
```

## Usage

```ts
import { SpecExplorer } from '@har-sdk/core';
import petstore from './petstore.collection.json';

const result = await new SpecExplorer().tryToImportSpec(petstore);
console.log(result);
// {
//   type: 'postman',
//   format: 'json',
//   doc: { 
//     info: {
//       name: 'Swagger Petstore',
//       schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
//     },
//     item: [
//       // ...
//     ]
//   },
//   name: 'Swagger Petstore.json'
// }
```
