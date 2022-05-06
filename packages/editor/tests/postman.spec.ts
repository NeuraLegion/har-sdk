import {
  TreeParser,
  PostmanEditor,
  SpecTreeNodeParam,
  SpecTreeNode
} from '../src';
import { Postman } from '@har-sdk/core';
import jsonPath from 'jsonpath';
import { PostmanValidator } from '@har-sdk/validator';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('PostmanEditor', () => {
  const sourcePath = './fixtures/postman-sample1.json';
  const source = readFileSync(resolve(__dirname, sourcePath), 'utf-8');
  const expectedResultPath = './fixtures/postman-sample1.result.json';

  describe('input validation', () => {
    it('should be validated with no errors', () => {
      const input: Postman.Document = JSON.parse(source);

      const result = new PostmanValidator().verify(input);

      return expect(result).resolves.toEqual([]);
    });
  });

  describe('TreeParser', () => {
    let postmanTreeParser: TreeParser;

    beforeEach(() => {
      postmanTreeParser = new PostmanEditor();
    });

    it('should be exception on invalid syntax', async () => {
      const setupPromise = postmanTreeParser.setup('{');
      await expect(setupPromise).rejects.toThrowError('Bad Postman collection');
    });

    it('should parse valid document', async () => {
      await postmanTreeParser.setup(source);
      const expected = JSON.parse(
        readFileSync(resolve(__dirname, expectedResultPath), 'utf-8')
      );

      const result = postmanTreeParser.parse();

      expect(result).toEqual(expected);
    });

    it('should be exception on call "parse" before "setup"', () =>
      expect(() => postmanTreeParser.parse()).toThrowError(
        'You have to call "setup" to initialize the document'
      ));

    it('should not be npe on empty item node', async () => {
      await postmanTreeParser.setup(
        JSON.stringify({
          info: {
            name: 'Postman document',
            schema:
              'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
          },
          item: []
        })
      );
      const expected = {
        jsonPointer: '/',
        path: '/',
        name: 'Postman document',
        children: [] as any[]
      };

      const result = postmanTreeParser.parse();

      expect(result).toEqual(expected);
    });
  });

  describe('Editor', () => {
    let postmanEditor: PostmanEditor;
    let inputTree: SpecTreeNode;

    beforeEach(async () => {
      postmanEditor = new PostmanEditor();

      await postmanEditor.setup(source);
      inputTree = postmanEditor.parse();
    });

    const shouldBeValidDoc = (doc: Postman.Document) =>
      expect(new PostmanValidator().verify(doc)).resolves.toEqual([]);

    describe('setParameterValue', () => {
      it('should be exception on call "removeNode" before "parse"', async () => {
        const nonInitializedEditor = new PostmanEditor();
        await nonInitializedEditor.setup(source);

        expect(() =>
          nonInitializedEditor.setParameterValue('/dummy', 42)
        ).toThrowError('You have to call "parse" to initialize the tree');
      });

      it('should set global variable value', () => {
        const newValue = 'https://neuralegion.com';
        const expected = [
          {
            paramType: 'variable',
            name: 'baseUrl',
            valueJsonPointer: '/variable/0/value',
            value: newValue
          }
        ];
        const inputParam: SpecTreeNodeParam = inputTree.parameters[0];

        const result = postmanEditor.setParameterValue(
          inputParam.valueJsonPointer,
          newValue
        );

        expect(result.parameters).toEqual(expected);
        expect(postmanEditor.doc.variable[0].value).toEqual(newValue);

        return shouldBeValidDoc(postmanEditor.doc);
      });

      it('should change path param value', () => {
        const path =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/subscriptions/:subscriptionId" && @.method=="GET")].parameters[?(@.name=="subscriptionId")]';
        const expected = 'id42';

        const inputParam: SpecTreeNodeParam = jsonPath.query(
          inputTree,
          path
        )[0];
        expect(inputParam.value).toEqual('<string>');

        const result = postmanEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        expect(jsonPath.query(result, path)[0].value).toEqual(expected);
        expect(
          jsonPath.query(
            postmanEditor.doc,
            '$..item[?(@.request.url.raw=="{{baseUrl}}/api/v1/subscriptions/:subscriptionId")].request.url.variable[?(@.key=="subscriptionId")]'
          )[0].value
        ).toEqual(expected);

        return shouldBeValidDoc(postmanEditor.doc);
      });
    });

    describe('removeNode', () => {
      it('should be exception on call "removeNode" before "parse"', async () => {
        const nonInitializedEditor = new PostmanEditor();
        await nonInitializedEditor.setup(source);

        expect(() => nonInitializedEditor.removeNode('/dummy')).toThrowError(
          'You have to call "parse" to initialize the tree'
        );
      });

      it('should remove group node', () => {
        const path = '$..children[?(@.path=="{{baseUrl}}/api/v1/statistics")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = postmanEditor.removeNode(inputNode.jsonPointer);

        expect(jsonPath.query(result, path)).toEqual([]);
        expect(postmanEditor.stringify()).toEqual(
          expect.not.arrayContaining(['{{baseUrl}}/api/v1/statistics'])
        );
        expect(result).toEqual(postmanEditor.parse());

        return shouldBeValidDoc(postmanEditor.doc);
      });

      it('should remove endpoint node', () => {
        const path =
          '$.children[?(@.path=="{{baseUrl}}/.well-known/change-password")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = postmanEditor.removeNode(inputNode.jsonPointer);

        expect(jsonPath.query(result, path)).toEqual([]);
        expect(postmanEditor.stringify()).toEqual(
          expect.not.arrayContaining([
            '{{baseUrl}}/.well-known/change-password'
          ])
        );
        expect(result).toEqual(postmanEditor.parse());

        return shouldBeValidDoc(postmanEditor.doc);
      });

      it('should update indices on remove', () => {
        const path1 =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/me/feed/activities" && @.method=="DELETE")]';
        const inputNode1 = jsonPath.query(inputTree, path1)[0] as SpecTreeNode;
        expect(inputNode1.jsonPointer).toEqual(
          '/item/0/item/3/item/0/item/1/item/0'
        );

        const path2 =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/me/feed/activities/:activityId" && @.method=="DELETE")]';
        const inputNode2 = jsonPath.query(inputTree, path2)[0] as SpecTreeNode;
        expect(inputNode2.jsonPointer).toEqual(
          '/item/0/item/3/item/0/item/1/item/1'
        );

        const result = postmanEditor.removeNode(inputNode1.jsonPointer);

        expect(jsonPath.query(result, path1)).toEqual([]);
        expect(jsonPath.query(result, path2)[0].jsonPointer).toEqual(
          '/item/0/item/3/item/0/item/1/item/0'
        );
      });
    });

    describe('stringify', () => {
      it('should serialize into json', async () => {
        await postmanEditor.setup(source);

        const result = postmanEditor.stringify();

        expect(typeof result).toBe('string');
        expect(result).toMatch(/^{/);
        expect(JSON.parse(result)).toEqual(JSON.parse(source));
      });
    });
  });
});
