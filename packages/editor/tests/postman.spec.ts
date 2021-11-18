import {
  TreeParser,
  PostmanEditor,
  SpecTreeNodeParam,
  SpecTreeNode
} from '../src';
import { Postman } from '@har-sdk/types';
import jsonPath from 'jsonpath';
import 'chai/register-should';
import { PostmanValidator } from '@har-sdk/validator';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

use(chaiAsPromised);

describe('PostmanEditor', () => {
  const sourcePath = './tests/postman-sample1.json';
  const source = readFileSync(resolve(sourcePath), 'utf-8');
  const expectedResultPath = './tests/postman-sample1.result.json';

  describe('input validation', () => {
    it('should be validated with no errors', () => {
      const input: Postman.Document = JSON.parse(source);

      const result = new PostmanValidator().verify(input);

      return result.should.eventually.deep.eq([]);
    });
  });

  describe('TreeParser', () => {
    let postmanTreeParser: TreeParser;

    beforeEach(() => {
      postmanTreeParser = new PostmanEditor();
    });

    it('should be exception on invalid syntax', () =>
      postmanTreeParser
        .setup('{')
        .should.be.rejectedWith(Error, 'Bad Postman collection'));

    it('should parse valid document', async () => {
      await postmanTreeParser.setup(source);
      const expected = JSON.parse(
        readFileSync(resolve(expectedResultPath), 'utf-8')
      );

      const result = postmanTreeParser.parse();

      result.should.deep.eq(expected);
    });

    it('should be exception on call "parse" before "setup"', () =>
      (() => postmanTreeParser.parse()).should.throw(
        Error,
        'You have to call "setup" to initialize the document'
      ));
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
      new PostmanValidator().verify(doc).should.eventually.deep.eq({
        errors: [],
        valid: true
      });

    describe('setParameterValue', () => {
      it('should be exception on call "removeNode" before "parse"', async () => {
        const nonInitializedEditor = new PostmanEditor();
        await nonInitializedEditor.setup(source);

        (() =>
          nonInitializedEditor.setParameterValue('/dummy', 42)).should.throw(
          Error,
          'You have to call "parse" to initialize the tree'
        );
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

        result.parameters.should.deep.equal(expected);
        shouldBeValidDoc(postmanEditor.doc);
        postmanEditor.doc.variable[0].value.should.equal(newValue);
      });

      it('should change path param value', () => {
        const path =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/subscriptions/:subscriptionId" && @.method=="GET")].parameters[?(@.name=="subscriptionId")]';
        const expected = 'id42';

        const inputParam: SpecTreeNodeParam = jsonPath.query(
          inputTree,
          path
        )[0];
        inputParam.value.should.eq('<string>');

        const result = postmanEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        jsonPath.query(result, path)[0].value.should.equal(expected);
        shouldBeValidDoc(postmanEditor.doc);
        jsonPath
          .query(
            postmanEditor.doc,
            '$..item[?(@.request.url.raw=="{{baseUrl}}/api/v1/subscriptions/:subscriptionId")].request.url.variable[?(@.key=="subscriptionId")]'
          )[0]
          .value.should.equal(expected);
      });
    });

    describe('removeNode', () => {
      it('should be exception on call "removeNode" before "parse"', async () => {
        const nonInitializedEditor = new PostmanEditor();
        await nonInitializedEditor.setup(source);

        (() => nonInitializedEditor.removeNode('/dummy')).should.throw(
          Error,
          'You have to call "parse" to initialize the tree'
        );
      });

      it('should remove group node', () => {
        const path = '$..children[?(@.path=="{{baseUrl}}/api/v1/statistics")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = postmanEditor.removeNode(inputNode.jsonPointer);

        jsonPath.query(result, path).should.be.empty;
        shouldBeValidDoc(postmanEditor.doc);
        postmanEditor
          .stringify()
          .should.not.include('{{baseUrl}}/api/v1/statistics');
        result.should.be.deep.equal(postmanEditor.parse());
      });

      it('should remove endpoint node', () => {
        const path =
          '$.children[?(@.path=="{{baseUrl}}/.well-known/change-password")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = postmanEditor.removeNode(inputNode.jsonPointer);

        shouldBeValidDoc(postmanEditor.doc);

        jsonPath.query(result, path).should.be.empty;
        postmanEditor
          .stringify()
          .should.not.include('{{baseUrl}}/.well-known/change-password');
        result.should.be.deep.equal(postmanEditor.parse());
      });

      it('should update indices on remove', () => {
        const path1 =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/me/feed/activities" && @.method=="DELETE")]';
        const inputNode1 = jsonPath.query(inputTree, path1)[0] as SpecTreeNode;
        inputNode1.jsonPointer.should.be.equal(
          '/item/0/item/3/item/0/item/1/item/0'
        );

        const path2 =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/me/feed/activities/:activityId" && @.method=="DELETE")]';
        const inputNode2 = jsonPath.query(inputTree, path2)[0] as SpecTreeNode;
        inputNode2.jsonPointer.should.be.equal(
          '/item/0/item/3/item/0/item/1/item/1'
        );

        const result = postmanEditor.removeNode(inputNode1.jsonPointer);

        jsonPath.query(result, path1).should.be.empty;
        jsonPath
          .query(result, path2)[0]
          .jsonPointer.should.be.equal('/item/0/item/3/item/0/item/1/item/0');
      });
    });

    describe('stringify', () => {
      it('should serialize into json', async () => {
        await postmanEditor.setup(source);

        const result = postmanEditor.stringify();

        result.should.be.a('string');
        result.should.match(/^{/);
        JSON.parse(result).should.be.deep.equal(JSON.parse(source));
      });
    });
  });
});
