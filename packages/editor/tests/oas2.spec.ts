import {
  OasV2Editor,
  SpecTreeNode,
  SpecTreeRequestBodyParam,
  SpecTreeNodeParam,
  TreeParser
} from '../src';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { load } from 'js-yaml';
import jsonPath from 'jsonpath';
import 'chai/register-should';
import { OpenAPIV2 } from '@har-sdk/types';
import { OASValidator } from '@har-sdk/validator';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

use(chaiAsPromised);

describe('oas parser', () => {
  const sourcePath = './tests/oas2-sample1.yaml';
  const source = readFileSync(resolve(sourcePath), 'utf-8');
  const expectedResultPath = './tests/oas2-sample1.result.json';

  describe('dereference', () => {
    it('should dereference all $refs', async () => {
      const parser = new $RefParser();
      const api = await parser.dereference(sourcePath);
      JSON.stringify(api).should.not.contain('$ref');
    });
  });

  describe('validate basic oas2 sample', () => {
    it('should be validated with no errors', async () => {
      const verifyResultPromise = new OASValidator().verify(
        load(source, { json: true }) as OpenAPIV2.Document
      );

      return verifyResultPromise.should.eventually.deep.eq({
        errors: [],
        valid: true
      });
    });
  });

  describe('oas v2 tree parser', () => {
    const openApiParser: TreeParser = new OasV2Editor();
    const resultTree = JSON.parse(
      readFileSync(resolve(expectedResultPath), 'utf-8')
    );

    it('should be exception on invalid syntax', async () =>
      openApiParser
        .setup('{')
        .should.be.rejectedWith(
          Error,
          /Bad Swagger\/OpenAPI V2 specification/
        ));

    it('should correctly parse yaml valid document', async () => {
      await openApiParser.setup(source);
      const tree = openApiParser.parse();
      tree.should.deep.eq(resultTree);
    });

    it('should have host as parameter of root node', async () => {
      await openApiParser.setup(source);
      const tree = openApiParser.parse();
      tree.parameters.should.be.instanceOf(Array);
      tree.parameters.length.should.equal(1);
      tree.parameters[0].value.should.eq('petstore.swagger.io');
    });
  });

  describe('oas v2 editor', () => {
    const openApiEditor = new OasV2Editor();

    const shouldBeValidDoc = (doc: OpenAPIV2.Document) =>
      new OASValidator().verify(doc).should.eventually.deep.eq({
        errors: [],
        valid: true
      });

    describe('oas v2 parameters editor', () => {
      it('should set host value', async () => {
        const newValue = 'neuralegion.com';

        await openApiEditor.setup(source);
        let tree = openApiEditor.parse();
        tree = openApiEditor.setParameterValue(
          tree.parameters[0].valueJsonPointer,
          newValue
        );

        openApiEditor['doc'].host.should.equal(newValue);

        shouldBeValidDoc(openApiEditor['doc']);

        tree.parameters.should.deep.equal([
          {
            paramType: 'variable',
            name: 'host',
            valueJsonPointer: '/host',
            value: newValue
          }
        ]);
      });

      it('should set referenced query param value', async () => {
        const path =
          '$..children[?(@.path=="/pet/findByStatus" && @.method=="get")].parameters[?(@.name=="status")]';
        const oldValue = 'available';
        const newValue = 'dummyStatus';

        await openApiEditor.setup(source);
        let tree = openApiEditor.parse();
        const queryParam = jsonPath.query(tree, path)[0];

        queryParam.value.should.equal('available');

        tree = openApiEditor.setParameterValue(
          queryParam.valueJsonPointer,
          newValue
        );

        shouldBeValidDoc(openApiEditor['doc']);

        jsonPath.query(tree, path)[0].value.should.equal(newValue);

        (
          openApiEditor['doc'].paths['/pet/findByStatus'].get
            .parameters[0] as OpenAPIV2.ParameterObject
        ).default.should.equal(newValue);

        (
          openApiEditor['doc'].parameters['status'] as OpenAPIV2.ParameterObject
        ).items.default.should.equal(oldValue);
      });

      it('should change query param existing value', async () => {
        const path =
          '$..children[?(@.path=="/pet/findByTags" && @.method=="get")].parameters[?(@.name=="tags")]';
        const newValue = 'dummyTag';

        await openApiEditor.setup(source);

        let tree = openApiEditor.parse();
        const queryParam = jsonPath.query(tree, path)[0] as SpecTreeNodeParam;
        queryParam.should.not.haveOwnProperty('value');

        tree = openApiEditor.setParameterValue(
          queryParam.valueJsonPointer,
          newValue
        );

        shouldBeValidDoc(openApiEditor['doc']);

        jsonPath.query(tree, path)[0].value.should.equal(newValue);

        (
          openApiEditor['doc'].paths['/pet/findByTags'].get
            .parameters[0] as OpenAPIV2.ParameterObject
        ).default.should.equal(newValue);
      });

      it('should set referenced body parameter value', async () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="patch")].parameters[?(@.name=="body")]';
        const newValue = '{"name":"test"}';

        await openApiEditor.setup(source);
        let tree = openApiEditor.parse();

        const bodyNode = jsonPath.query(
          tree,
          path
        )[0] as SpecTreeRequestBodyParam;
        bodyNode.should.not.haveOwnProperty('value');

        tree = openApiEditor.setParameterValue(
          bodyNode.valueJsonPointer,
          newValue
        );

        shouldBeValidDoc(openApiEditor['doc']);

        jsonPath.query(tree, path)[0].value.should.equal(newValue);

        (
          openApiEditor['doc'].paths['/pet/{petId}'].patch.parameters.find(
            (p) => (p as OpenAPIV2.Parameter).name === 'body'
          ) as OpenAPIV2.Parameter
        ).default.should.equal(newValue);
      });
    });

    describe('oas v2 nodes remover', () => {
      it('should remove existing path node', async () => {
        const path = '$..children[?(@.path=="/pet/{petId}")]';
        await openApiEditor.setup(source);

        let tree = openApiEditor.parse();
        const pathNode = jsonPath.query(tree, path)[0] as SpecTreeNode;

        tree = openApiEditor.removeNode(pathNode.jsonPointer);

        shouldBeValidDoc(openApiEditor['doc']);

        jsonPath.query(tree, path).should.be.empty;
        openApiEditor['doc'].paths.should.not.haveOwnProperty(path);

        openApiEditor['tree'].should.be.deep.equal(openApiEditor.parse());
      });

      it('should correctly remove existing endpoint node', async () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="get")]';
        await openApiEditor.setup(source);

        let tree = openApiEditor.parse();
        const endPointNode = jsonPath.query(tree, path)[0] as SpecTreeNode;

        tree = openApiEditor.removeNode(endPointNode.jsonPointer);

        shouldBeValidDoc(openApiEditor['doc']);

        jsonPath.query(tree, path).should.be.empty;

        openApiEditor['doc'].paths['/pet/{petId}'].should.not.haveOwnProperty(
          'get'
        );

        openApiEditor['tree'].should.be.deep.equal(openApiEditor.parse());
      });
    });
  });
});