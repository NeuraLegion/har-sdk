import {
  OasV2Editor,
  SpecTreeNode,
  SpecTreeRequestBodyParam,
  SpecTreeNodeParam,
  TreeParser
} from '../src';
import { load } from 'js-yaml';
import jsonPath from 'jsonpath';
import { OpenAPIV2 } from '@har-sdk/core';
import { OASValidator } from '@har-sdk/validator';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('OasV2Editor', () => {
  const sourcePath = './fixtures/oas2-sample1.yaml';
  const source = readFileSync(resolve(__dirname, sourcePath), 'utf-8');

  describe('input validation', () => {
    it('should be validated with no errors', () => {
      const input = load(source, { json: true }) as OpenAPIV2.Document;

      const result = new OASValidator().verify(input);

      return expect(result).resolves.toEqual([]);
    });
  });

  describe('TreeParser', () => {
    let openApiParser: TreeParser;

    beforeEach(() => {
      openApiParser = new OasV2Editor();
    });

    it('should be exception on invalid syntax', async () => {
      const setupPromise = openApiParser.setup('{');
      await expect(setupPromise).rejects.toThrowError(
        'Bad Swagger/OpenAPI V2 specification'
      );
    });

    it('should correctly parse valid yaml document', async () => {
      await openApiParser.setup(source);
      const expected = JSON.parse(
        readFileSync(
          resolve(__dirname, './fixtures/oas2-sample1.result.json'),
          'utf-8'
        )
      );

      const result = openApiParser.parse();

      expect(result).toEqual(expected);
    });

    it('should correctly parse valid json document', async () => {
      const sourceJson = readFileSync(
        resolve(__dirname, './fixtures/oas2-sample1.json'),
        'utf-8'
      );
      await openApiParser.setup(sourceJson);

      const expected = JSON.parse(
        readFileSync(
          resolve(__dirname, './fixtures/oas2-sample1.result.json'),
          'utf-8'
        )
      );

      const result = openApiParser.parse();

      expect(result).toEqual(expected);
    });

    it('should retrieve default parameter value', async () => {
      const sourceYaml = readFileSync(
        resolve(__dirname, './fixtures/oas2-default-param-value.yaml'),
        'utf-8'
      );
      await openApiParser.setup(sourceYaml);

      const expected = JSON.parse(
        readFileSync(
          resolve(__dirname, './fixtures/oas2-default-param-value.result.json'),
          'utf-8'
        )
      );

      const result = openApiParser.parse();

      expect(result).toEqual(expected);
    });

    it.each([
      {
        testCase: 'operation and root consumes nodes are missing',
        input: 'oas2-missing-consumes.yaml',
        expected: 'oas2-missing-consumes.result.json'
      },
      {
        testCase: 'operation consumes overrides root consumes node',
        input: 'oas2-override-consumes.yaml',
        expected: 'oas2-override-consumes.result.json'
      }
    ])('should pick media type when $testCase', async ({ input, expected }) => {
      const sourceYaml = readFileSync(
        resolve(__dirname, `./fixtures/${input}`),
        'utf-8'
      );
      await openApiParser.setup(sourceYaml);

      const expectedJson = JSON.parse(
        readFileSync(resolve(__dirname, `./fixtures/${expected}`), 'utf-8')
      );

      const result = openApiParser.parse();

      expect(result).toEqual(expectedJson);
    });

    it('should be exception on call "parse" before "setup"', () =>
      expect(() => openApiParser.parse()).toThrowError(
        'You have to call "setup" to initialize the document'
      ));
  });

  describe('Editor', () => {
    let openApiEditor: OasV2Editor;
    let inputTree: SpecTreeNode;

    beforeEach(async () => {
      openApiEditor = new OasV2Editor();

      await openApiEditor.setup(source);
      inputTree = openApiEditor.parse();
    });

    const shouldBeValidDoc = (doc: OpenAPIV2.Document) =>
      expect(new OASValidator().verify(doc)).resolves.toEqual([]);

    describe('setParameterValue', () => {
      it('should be exception on call "setParameterValue" before "parse"', async () => {
        const nonInitializedEditor = new OasV2Editor();
        await nonInitializedEditor.setup(source);

        expect(() =>
          nonInitializedEditor.setParameterValue('/dummy', 42)
        ).toThrowError('You have to call "parse" to initialize the tree');
      });

      it('should set host value', () => {
        const newValue = 'neuralegion.com';
        const expected = [
          {
            paramType: 'variable',
            name: 'host',
            valueJsonPointer: '/host',
            value: newValue
          }
        ];
        const inputParam: SpecTreeNodeParam = inputTree.parameters[0];

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          newValue
        );

        expect(result.parameters).toEqual(expected);
        expect(openApiEditor.doc.host).toEqual(newValue);

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
            openApiEditor.doc.paths['/pet/findByStatus'].get
              .parameters[0] as OpenAPIV2.ParameterObject
          ).default
        ).toEqual(expected);
        expect(
          (openApiEditor.doc.parameters['status'] as OpenAPIV2.ParameterObject)
            .items.default
        ).toEqual(oldValue);

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
              .parameters[0] as OpenAPIV2.ParameterObject
          ).default
        ).toEqual(expected);

        return shouldBeValidDoc(openApiEditor.doc);
      });

      it('should set referenced body parameter value', () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="PATCH")].parameters[?(@.paramType=="requestBody")]';
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
            openApiEditor.doc.paths['/pet/{petId}'].patch.parameters.find(
              (p) => (p as OpenAPIV2.Parameter).name === 'body'
            ) as OpenAPIV2.Parameter
          ).schema.default
        ).toEqual(expected);

        return shouldBeValidDoc(openApiEditor.doc);
      });
    });

    describe('removeNode', () => {
      it('should be exception on call "removeNode" before "parse"', async () => {
        const nonInitializedEditor = new OasV2Editor();
        await nonInitializedEditor.setup(source);

        expect(() => nonInitializedEditor.removeNode('/dummy')).toThrowError(
          'You have to call "parse" to initialize the tree'
        );
      });

      it('should remove path node', () => {
        const path = '$..children[?(@.path=="/pet/{petId}")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = openApiEditor.removeNode(inputNode.jsonPointer);

        expect(jsonPath.query(result, path)).toEqual([]);
        expect(openApiEditor.doc.paths).not.toHaveProperty(path);
        expect(result).toEqual(openApiEditor.parse());

        return shouldBeValidDoc(openApiEditor.doc);
      });

      it('should remove endpoint node', () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="GET")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = openApiEditor.removeNode(inputNode.jsonPointer);

        expect(jsonPath.query(result, path)).toEqual([]);
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
        expect(result).toMatch(/^swagger:/);
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
