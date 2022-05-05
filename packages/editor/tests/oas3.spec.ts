import {
  OasV3Editor,
  SpecTreeNode,
  SpecTreeRequestBodyParam,
  SpecTreeNodeParam,
  TreeParser
} from '../src';
import { load } from 'js-yaml';
import jsonPath from 'jsonpath';
import { OpenAPIV3 } from '@har-sdk/core';
import { OASValidator } from '@har-sdk/validator';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('OasV3Editor', () => {
  const sourcePath = './fixtures/oas3-sample1.yaml';
  const source = readFileSync(resolve(__dirname, sourcePath), 'utf-8');

  describe('input validation', () => {
    it('should be validated with no errors', () => {
      const input = load(source, { json: true }) as OpenAPIV3.Document;

      const result = new OASValidator().verify(input);

      return expect(result).resolves.toEqual([]);
    });
  });

  describe('TreeParser', () => {
    let openApiParser: TreeParser;

    beforeEach(() => {
      openApiParser = new OasV3Editor();
    });

    it('should be exception on invalid syntax', async () => {
      const setupPromise = openApiParser.setup('{');
      await expect(setupPromise).rejects.toThrowError(
        'Bad OpenAPI V3 specification'
      );
    });

    it('should correctly parse yaml valid document', async () => {
      await openApiParser.setup(source);
      const expected = JSON.parse(
        readFileSync(
          resolve(__dirname, './fixtures/oas3-sample1.result.json'),
          'utf-8'
        )
      );

      const result = openApiParser.parse();

      expect(result).toEqual(expected);
    });

    it('should be exception on call "parse" before "setup"', () =>
      expect(() => openApiParser.parse()).toThrowError(
        'You have to call "setup" to initialize the document'
      ));
  });

  describe('Editor', () => {
    let openApiEditor: OasV3Editor;
    let inputTree: SpecTreeNode;

    beforeEach(async () => {
      openApiEditor = new OasV3Editor();

      await openApiEditor.setup(source);
      inputTree = openApiEditor.parse();
    });

    const shouldBeValidDoc = (doc: OpenAPIV3.Document) =>
      expect(new OASValidator().verify(doc)).resolves.toEqual([]);

    describe('setParameterValue', () => {
      it('should be exception on call "setParameterValue" before "parse"', async () => {
        const nonInitializedEditor = new OasV3Editor();
        await nonInitializedEditor.setup(source);

        expect(() =>
          nonInitializedEditor.setParameterValue('/dummy', 42)
        ).toThrowError('You have to call "parse" to initialize the tree');
      });

      it('should set servers value', () => {
        const newValue = [{ url: 'https://neuralegion.com' }];
        const expected = [
          {
            paramType: 'variable',
            name: 'servers',
            valueJsonPointer: '/servers',
            value: newValue
          }
        ];
        const inputParam: SpecTreeNodeParam = inputTree.parameters[0];

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          newValue
        );

        expect(result.parameters).toEqual(expected);
        expect(openApiEditor.doc.servers).toEqual(newValue);

        return shouldBeValidDoc(openApiEditor.doc);
      });

      it('should set referenced query param value', () => {
        const path =
          '$..children[?(@.path=="/pet/findByStatus" && @.method=="GET")].parameters[?(@.name=="status")]';
        const oldValue = 'available';
        const expected = 'dummyStatus';

        const inputParam: SpecTreeNodeParam = jsonPath.query(
          inputTree,
          path
        )[0];
        expect(inputParam.value).toEqual(oldValue);

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        expect(jsonPath.query(result, path)[0].value).toEqual(expected);
        expect(
          (
            openApiEditor.doc.components.parameters[
              'status'
            ] as OpenAPIV3.ParameterObject
          ).example
        ).toEqual(oldValue);
        expect(
          (
            openApiEditor.doc.paths['/pet/findByStatus'].get
              .parameters[0] as OpenAPIV3.ParameterObject
          ).example
        ).toEqual(expected);

        return shouldBeValidDoc(openApiEditor.doc);
      });

      it('should change query param existing value', () => {
        const path =
          '$..children[?(@.path=="/pet/findByTags" && @.method=="GET")].parameters[?(@.name=="tags")]';
        const expected = 'dummyTag';

        const inputParam: SpecTreeNodeParam = jsonPath.query(
          inputTree,
          path
        )[0] as SpecTreeNodeParam;
        expect(inputParam).not.toHaveProperty('value');

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        expect(jsonPath.query(result, path)[0].value).toEqual(expected);
        expect(
          (
            openApiEditor.doc.paths['/pet/findByTags'].get
              .parameters[0] as OpenAPIV3.ParameterObject
          ).example
        ).toEqual(expected);

        return shouldBeValidDoc(openApiEditor.doc);
      });

      it('should set referenced request body value', () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="PATCH")].parameters[?(@.bodyType)]';
        const expected = '{"name":"test"}';

        const inputParam: SpecTreeRequestBodyParam = jsonPath.query(
          inputTree,
          path
        )[0] as SpecTreeRequestBodyParam;
        expect(inputParam).not.toHaveProperty('value');

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        expect(jsonPath.query(result, path)[0].value).toEqual(expected);
        expect(
          (
            openApiEditor.doc.paths['/pet/{petId}'].patch
              .requestBody as OpenAPIV3.RequestBodyObject
          ).content[inputParam.bodyType].example
        ).toEqual(expected);

        return shouldBeValidDoc(openApiEditor.doc);
      });
    });

    describe('removeNode', () => {
      it('should be exception on call "removeNode" before "parse"', async () => {
        const nonInitializedEditor = new OasV3Editor();
        await nonInitializedEditor.setup(source);

        expect(() => nonInitializedEditor.removeNode('/dummy')).toThrowError(
          'You have to call "parse" to initialize the tree'
        );
      });

      it('should remove path node', () => {
        const path = '$..children[?(@.path=="/pet/{petId}")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = openApiEditor.removeNode(inputNode.jsonPointer);

        expect(jsonPath.query(result, path)).toMatchObject([]);
        expect(openApiEditor.doc.paths).not.toHaveProperty(path);
        expect(result).toEqual(openApiEditor.parse());

        return shouldBeValidDoc(openApiEditor.doc);
      });

      it('should remove endpoint node', () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="GET")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = openApiEditor.removeNode(inputNode.jsonPointer);

        expect(jsonPath.query(result, path)).toMatchObject([]);
        expect(openApiEditor.doc.paths['/pet/{petId}']).not.toHaveProperty(
          'get'
        );
        expect(result).toEqual(openApiEditor.parse());

        return shouldBeValidDoc(openApiEditor.doc);
      });
    });

    describe('stringify', () => {
      it('should serialize yaml into yaml', () => {
        const result = openApiEditor.stringify();

        expect(typeof result).toBe('string');
        expect(result).toMatch(/^openapi:/);
      });

      it('should serialize json into json', async () => {
        const jsonSource = JSON.stringify(load(source, { json: true }));

        await openApiEditor.setup(jsonSource);
        const result = openApiEditor.stringify();

        expect(typeof result).toBe('string');
        expect(result).toEqual(jsonSource);
      });
    });
  });
});
