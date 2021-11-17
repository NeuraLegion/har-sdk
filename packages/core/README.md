# @har-sdk/core

The base package can be used to import specification files (i.e. HAR, OAS and Postman Collection) and detect their type.

## Setup

```bash
npm i --save @har-sdk/core
```

## Usage

To import a specification you just need to create an instance of `SpecExplorer` and call its `tryToImportSpec` method passing the data file. The explorer performs syntatic analisis and parse provioded file.

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

To configure the list of importers, you can pass them as an array to the constructor.

```ts
import { SpecExplorer, HarImporter } from '@har-sdk/core';

const explorer = new SpecExplorer([new HarImporter()]);
```

To extend an explorer by adding a new custom importer, you can easily implement an `Importer` interface.

```ts
import { Importer, SpecType, Spec } from '@har-sdk/core';

class RamlImporter {
  get type() {
    return 'raml';
  }

  isSupported(spec) {
    // implementation
  }

  async importSpec(content) {
    // implementation
  }
}
```
