# @har-sdk/editor

Parses OAS and Postman API specification files into form of tree with endpoints and parameters as leaves; tree is useful for GUI representation of specification parameters

Each node and parameter value have JSON pointer, that could be used to change parameter value or to remove node.

## Setup

```bash
npm i --save @har-sdk/editor
```

## Usage

```ts
import { OasV3Editor } from '@har-sdk/editor';

const editor = new OasV3Editor();
openApiParser.setup(jsonOrYamlSourceString).then(() => {
  // tree parsing
  let tree: SpecTreeNode = openApiParser.parse();

  // setting/updating parameter value
  tree = openApiEditor.setParameterValue(
    // parameter `valueJsonPointer` is pointer to `example` for oas3 and `default` for oas2;
    // referenced parameter will be dereferenced automatically
    tree.parameters[0].valueJsonPointer,
    someNewValue
  );

  // removing specific node
  tree = openApiEditor.removeNode(tree.children[1].jsonPointer);

  // serizalization
  const serializedUpdatedSpec = openApiEditor.stringify();
});
```

## API

### Available editors

- [`OasV2Editor`](https://github.com/NeuraLegion/har-sdk/blob/master/packages/editor/src/editor/oas/v2/OasV2Editor.ts)
- [`OasV3Editor`](https://github.com/NeuraLegion/har-sdk/blob/master/packages/editor/src/editor/oas/v3/OasV3Editor.ts)
- [`PostmanEditor`](https://github.com/NeuraLegion/har-sdk/blob/master/packages/editor/src/editor/postman/PostmanEditor.ts)

All of them implement both [`TreeParser`](https://github.com/NeuraLegion/har-sdk/blob/master/packages/editor/src/editor/TreeParser.ts) and [`Editor`](https://github.com/NeuraLegion/har-sdk/blob/master/packages/editor/src/editor/Editor.ts) interfaces.

### API interfaces

```ts
export interface TreeParser {
  setup(source: string): Promise<void>;
  parse(): SpecTreeNode;
  stringify(): string;
}

export interface Editor {
  setParameterValue(jsonPointer: string, value: any): SpecTreeNode;
  removeNode(jsonPointer: string): SpecTreeNode;
}
```

### Tree node interfaces

```ts
export interface SpecTreeNode {
  readonly path: string;
  readonly name?: string;
  readonly method?: HttpMethod;
  readonly jsonPointer: string;
  readonly children?: ReadonlyArray<SpecTreeNode>;
  readonly parameters?: ReadonlyArray<SpecTreeNodeParam>;
}

export interface SpecTreeNodeParam {
  readonly paramType: 'location' | 'requestBody' | 'variable';
  readonly value?: any;
  readonly valueJsonPointer: string;
}

// Specific parameter types with specific properties

export interface SpecTreeNodeVariableParam extends SpecTreeNodeParam {
  readonly paramType: 'variable';
  readonly name: string;
}

export interface SpecTreeNodeLocationParam extends SpecTreeNodeParam {
  readonly paramType: 'location';
  readonly name: string;
  readonly location: ParamLocation;
}

export interface SpecTreeRequestBodyParam extends SpecTreeNodeParam {
  readonly paramType: 'requestBody';
  readonly bodyType: string;
}

// Enums

export enum ParamLocation {
  PATH = 'path',
  QUERY = 'query',
  HEADER = 'header',
  BODY = 'body'
}

export enum HttpMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
  PATCH = 'PATCH',
  TRACE = 'TRACE'
}
```
