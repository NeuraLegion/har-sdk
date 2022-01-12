# @har-sdk/core

The base package can be used to import specification files (i.e. HAR, OAS and Postman Collection) and detect their type.

## Setup

```bash
npm i --save @har-sdk/core
```

## Usage

To import a specification you just need to create an instance of `SpecImporter` and call its `import` method passing the data file. The importer performs syntactic analysis and parses a provided file.

```ts
import { SpecImporter } from '@har-sdk/core';

const result = await new SpecImporter().import(sourceAsString);
console.log(result);
// {
//   type: 'postman',
//   format: 'json',
//   doc: {
//     info: {
//       name: 'Postman Sample',
//       schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
//     },
//     item: [
//       // ...
//     ]
//   },
//   name: 'Postman Sample.json'
// }
```

To configure the list of importers, you can pass them as an array to the constructor.

```ts
import { SpecImporter, HarImporter } from '@har-sdk/core';

const explorer = new SpecImporter([new HarImporter()]);
```

To extend an explorer by adding a new custom importer, you can easily implement an `Importer` interface.

```ts
import { Importer, Doc, Spec, Importer } from '@har-sdk/core';

class RamlImporter implements Importer<'raml'> {
  get type(): 'raml' {
    return 'raml';
  }

  async import(content: string): Promise<Spec<'raml'>> {
    // your code

    return {
      // other fields
      type: this.type,
      format: 'yaml'
    };
  }
}
```

The package also contains a set of useful utilities like `normalizeUrl`:

```ts
import { normalizeUrl } from '@har-sdk/core';

normalizeUrl('HTTP://example.COM////foo////dummy/../bar/?'); // http://example.com/foo/bar
```
