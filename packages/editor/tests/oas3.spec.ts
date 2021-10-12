import {
  OpenApiV3Editor,
  SpecTreeNode,
  SpecTreeRequestBodyParam,
  SpecTreeNodeParam,
  TreeParser
} from '../src';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { load } from 'js-yaml';
import jsonPointer from 'json-pointer';
import jsonPath from 'jsonpath';
import 'chai/register-should';
import { OpenAPIV3 } from '@har-sdk/types';
import { OASValidator } from '@har-sdk/validator';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

use(chaiAsPromised);

describe('oas parser', () => {
  const source = readFileSync(resolve('./tests/oas3-sample1.yaml'), 'utf-8');

  describe('jsonPointer', () => {
    it('should set missing prop by jsonPointer', async () => {
      const target = {};
      jsonPointer.set(target, '/servers', [{ url: 'https://nexploit.app' }]);
      target.should.have.key('servers');
    });
  });

  describe('dereference', () => {
    it('should dereference all $refs', async () => {
      const parser = new $RefParser();
      const api = await parser.dereference('./tests/oas3-sample1.yaml');
      JSON.stringify(api).should.not.contain('$ref');
    });
  });

  describe('validate basic oas3 sample', () => {
    it('should be validated with no errors', async () => {
      const verifyResultPromise = new OASValidator().verify(
        load(source, { json: true }) as OpenAPIV3.Document
      );

      return verifyResultPromise.should.eventually.deep.eq({
        errors: [],
        valid: true
      });
    });
  });

  describe('oas v3 tree parser', () => {
    const openApiParser: TreeParser = new OpenApiV3Editor();
    const resultTree = JSON.parse(
      readFileSync(resolve('./tests/oas3-sample1.result.json'), 'utf-8')
    );

    it('should be exception on invalid syntax', async () =>
      openApiParser
        .setup('{')
        .should.be.rejectedWith(Error, /Bad Swagger\/OpenAPI specification/));

    it('should correctly parse yaml valid document', async () => {
      await openApiParser.setup(source);
      const tree = openApiParser.parse();
      tree.should.deep.eq(resultTree);
    });

    it('should have servers json as parameter of root node in tree', async () => {
      await openApiParser.setup(source);
      const tree = openApiParser.parse();
      tree.parameters.should.be.instanceOf(Array);
      tree.parameters.length.should.equal(1);
      tree.parameters[0].value.should.be.instanceOf(Array);
      tree.parameters[0].value.length.should.equal(2);
    });
  });

  describe('oas v3 editor', () => {
    const openApiEditor = new OpenApiV3Editor();

    const shouldBeValidDoc = (doc: OpenAPIV3.Document) =>
      new OASValidator().verify(doc).should.eventually.deep.eq({
        errors: [],
        valid: true
      });

    describe('oas v3 parameters editor', () => {
      it('should set servers value', async () => {
        const newValue = [{ url: 'https://neuralegion.com' }];

        await openApiEditor.setup(source);
        let tree = openApiEditor.parse();
        tree = openApiEditor.setParameterValue(
          tree.parameters[0].valueJsonPointer,
          newValue
        );

        openApiEditor['doc'].servers.should.deep.equal(newValue);

        shouldBeValidDoc(openApiEditor['doc']);

        tree.parameters.should.deep.equal([
          {
            paramType: 'variable',
            name: 'servers',
            valueJsonPointer: '/servers',
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
            .parameters[0] as OpenAPIV3.ParameterObject
        ).example.should.equal(newValue);

        (
          openApiEditor['doc'].components.parameters[
            'status'
          ] as OpenAPIV3.ParameterObject
        ).example.should.equal(oldValue);
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
            .parameters[0] as OpenAPIV3.ParameterObject
        ).example.should.equal(newValue);
      });

      it('should set referenced request body value', async () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="patch")].parameters[?(@.bodyType)]';
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
          openApiEditor['doc'].paths['/pet/{petId}'].patch
            .requestBody as OpenAPIV3.RequestBodyObject
        ).content[bodyNode.bodyType].example.should.equal(newValue);
      });
    });

    describe('oas v3 nodes remover', () => {
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
