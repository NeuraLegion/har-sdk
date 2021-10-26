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

describe('postman parser', () => {
  const sourcePath = './tests/postman-sample1.json';
  const source = readFileSync(resolve(sourcePath), 'utf-8');
  const expectedResultPath = './tests/postman-sample1.result.json';

  describe('validate postman sample', () => {
    it('should be validated with no errors', async () => {
      const verifyResultPromise = new PostmanValidator().verify(
        JSON.parse(source)
      );

      return verifyResultPromise.should.eventually.deep.eq({
        errors: [],
        valid: true
      });
    });
  });

  describe('postman tree parser', () => {
    const postmanTreeParser: TreeParser = new PostmanEditor();
    const resultTree = JSON.parse(
      readFileSync(resolve(expectedResultPath), 'utf-8')
    );

    it('should be exception on invalid syntax', async () =>
      postmanTreeParser
        .setup('{')
        .should.be.rejectedWith(Error, /Bad Postman collection/));

    it('should parse valid document', async () => {
      await postmanTreeParser.setup(source);
      const tree = postmanTreeParser.parse();
      tree.should.deep.eq(resultTree);
    });
  });

  describe('postman editor', () => {
    const postmanEditor = new PostmanEditor();

    const shouldBeValidDoc = (doc: Postman.Document) =>
      new PostmanValidator().verify(doc).should.eventually.deep.eq({
        errors: [],
        valid: true
      });

    describe('postman parameters editor', () => {
      it('should set global variable value', async () => {
        const newValue = 'https://neuralegion.com';

        await postmanEditor.setup(source);
        let tree = postmanEditor.parse();
        tree = postmanEditor.setParameterValue(
          tree.parameters[0].valueJsonPointer,
          newValue
        );

        postmanEditor['doc'].variable[0].value.should.equal(newValue);

        shouldBeValidDoc(postmanEditor['doc']);

        tree.parameters.should.deep.equal([
          {
            paramType: 'variable',
            name: 'baseUrl',
            valueJsonPointer: '/variable/0/value',
            value: newValue
          }
        ]);
      });

      it('should change path param value', async () => {
        const path =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/subscriptions/:subscriptionId" && @.method=="GET")].parameters[?(@.name=="subscriptionId")]';
        const newValue = 'id42';

        await postmanEditor.setup(source);

        let tree = postmanEditor.parse();
        const queryParam = jsonPath.query(tree, path)[0] as SpecTreeNodeParam;
        queryParam.value.should.eq('<string>');

        tree = postmanEditor.setParameterValue(
          queryParam.valueJsonPointer,
          newValue
        );

        shouldBeValidDoc(postmanEditor['doc']);

        jsonPath.query(tree, path)[0].value.should.equal(newValue);

        const docPath =
          '$..item[?(@.request.url.raw=="{{baseUrl}}/api/v1/subscriptions/:subscriptionId")].request.url.variable[?(@.key=="subscriptionId")]';
        jsonPath
          .query(postmanEditor['doc'], docPath)[0]
          .value.should.equal(newValue);
      });
    });

    describe('postman nodes remover', () => {
      it('should remove group node', async () => {
        await postmanEditor.setup(source);
        let tree = postmanEditor.parse();

        const path = '$..children[?(@.path=="{{baseUrl}}/api/v1/statistics")]';
        const pathNode = jsonPath.query(tree, path)[0] as SpecTreeNode;

        tree = postmanEditor.removeNode(pathNode.jsonPointer);

        shouldBeValidDoc(postmanEditor['doc']);

        jsonPath.query(tree, path).should.be.empty;
        postmanEditor
          .stringify()
          .should.not.include('{{baseUrl}}/api/v1/statistics');

        postmanEditor['tree'].should.be.deep.equal(postmanEditor.parse());
      });

      it('should remove endpoint node', async () => {
        await postmanEditor.setup(source);
        let tree = postmanEditor.parse();

        const path =
          '$.children[?(@.path=="{{baseUrl}}/.well-known/change-password")]';
        const endpointNode = jsonPath.query(tree, path)[0] as SpecTreeNode;

        tree = postmanEditor.removeNode(endpointNode.jsonPointer);

        shouldBeValidDoc(postmanEditor['doc']);

        jsonPath.query(tree, path).should.be.empty;
        postmanEditor
          .stringify()
          .should.not.include('{{baseUrl}}/.well-known/change-password');

        postmanEditor['tree'].should.be.deep.equal(postmanEditor.parse());
      });

      it('should update indices on remove', async () => {
        await postmanEditor.setup(source);
        let tree = postmanEditor.parse();

        const path1 =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/me/feed/activities" && @.method=="DELETE")]';
        const endpointNode1 = jsonPath.query(tree, path1)[0] as SpecTreeNode;
        endpointNode1.jsonPointer.should.be.equal(
          '/item/0/item/3/item/0/item/1/item/0'
        );

        const path2 =
          '$..children[?(@.path=="{{baseUrl}}/api/v1/me/feed/activities/:activityId" && @.method=="DELETE")]';
        const endpointNode2 = jsonPath.query(tree, path2)[0] as SpecTreeNode;
        endpointNode2.jsonPointer.should.be.equal(
          '/item/0/item/3/item/0/item/1/item/1'
        );

        tree = postmanEditor.removeNode(endpointNode1.jsonPointer);
        jsonPath.query(tree, path1).should.be.empty;

        const endpointNode2Changed = jsonPath.query(
          tree,
          path2
        )[0] as SpecTreeNode;
        endpointNode2Changed.jsonPointer.should.be.equal(
          '/item/0/item/3/item/0/item/1/item/0'
        );
      });
    });
  });
});
