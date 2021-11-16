import {
  OasV3Editor,
  SpecTreeNode,
  SpecTreeRequestBodyParam,
  SpecTreeNodeParam,
  TreeParser
} from '../src';
import { load } from 'js-yaml';
import jsonPath from 'jsonpath';
import 'chai/register-should';
import { OpenAPIV3 } from '@har-sdk/types';
import { OASValidator } from '@har-sdk/validator';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

use(chaiAsPromised);

describe('OasV3Editor', () => {
  const sourcePath = './tests/oas3-sample1.yaml';
  const source = readFileSync(resolve(sourcePath), 'utf-8');

  describe('input validation', () => {
    it('should be validated with no errors', () => {
      const input = load(source, { json: true }) as OpenAPIV3.Document;

      const result = new OASValidator().verify(input);

      return result.should.eventually.deep.eq([]);
    });
  });

  describe('TreeParser', () => {
    let openApiParser: TreeParser;

    beforeEach(() => {
      openApiParser = new OasV3Editor();
    });

    it('should be exception on invalid syntax', () =>
      openApiParser
        .setup('{')
        .should.be.rejectedWith(Error, 'Bad OpenAPI V3 specification'));

    it('should correctly parse yaml valid document', async () => {
      await openApiParser.setup(source);
      const expected = JSON.parse(
        readFileSync(resolve('./tests/oas3-sample1.result.json'), 'utf-8')
      );

      const result = openApiParser.parse();

      result.should.deep.eq(expected);
    });

    it('should be exception on call "parse" before "setup"', () =>
      (() => openApiParser.parse()).should.throw(
        Error,
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
      new OASValidator().verify(doc).should.eventually.deep.eq([]);

    describe('setParameterValue', () => {
      it('should be exception on call "setParameterValue" before "parse"', async () => {
        const nonInitializedEditor = new OasV3Editor();
        await nonInitializedEditor.setup(source);

        (() =>
          nonInitializedEditor.setParameterValue('/dummy', 42)).should.throw(
          Error,
          'You have to call "parse" to initialize the tree'
        );
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

        result.parameters.should.deep.equal(expected);
        shouldBeValidDoc(openApiEditor.getDocument());
        openApiEditor.getDocument().servers.should.deep.equal(newValue);
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
        inputParam.value.should.equal(oldValue);

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        jsonPath.query(result, path)[0].value.should.equal(expected);
        shouldBeValidDoc(openApiEditor.getDocument());
        (
          openApiEditor.getDocument().components.parameters[
            'status'
          ] as OpenAPIV3.ParameterObject
        ).example.should.equal(oldValue);
        (
          openApiEditor.getDocument().paths['/pet/findByStatus'].get
            .parameters[0] as OpenAPIV3.ParameterObject
        ).example.should.equal(expected);
      });

      it('should change query param existing value', () => {
        const path =
          '$..children[?(@.path=="/pet/findByTags" && @.method=="GET")].parameters[?(@.name=="tags")]';
        const expected = 'dummyTag';

        const inputParam: SpecTreeNodeParam = jsonPath.query(
          inputTree,
          path
        )[0] as SpecTreeNodeParam;
        inputParam.should.not.haveOwnProperty('value');

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        jsonPath.query(result, path)[0].value.should.equal(expected);
        shouldBeValidDoc(openApiEditor.getDocument());
        (
          openApiEditor.getDocument().paths['/pet/findByTags'].get
            .parameters[0] as OpenAPIV3.ParameterObject
        ).example.should.equal(expected);
      });

      it('should set referenced request body value', () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="PATCH")].parameters[?(@.bodyType)]';
        const expected = '{"name":"test"}';

        const inputParam: SpecTreeRequestBodyParam = jsonPath.query(
          inputTree,
          path
        )[0] as SpecTreeRequestBodyParam;
        inputParam.should.not.haveOwnProperty('value');

        const result = openApiEditor.setParameterValue(
          inputParam.valueJsonPointer,
          expected
        );

        jsonPath.query(result, path)[0].value.should.equal(expected);
        shouldBeValidDoc(openApiEditor.getDocument());
        (
          openApiEditor.getDocument().paths['/pet/{petId}'].patch
            .requestBody as OpenAPIV3.RequestBodyObject
        ).content[inputParam.bodyType].example.should.equal(expected);
      });
    });

    describe('removeNode', () => {
      it('should be exception on call "removeNode" before "parse"', async () => {
        const nonInitializedEditor = new OasV3Editor();
        await nonInitializedEditor.setup(source);

        (() => nonInitializedEditor.removeNode('/dummy')).should.throw(
          Error,
          'You have to call "parse" to initialize the tree'
        );
      });

      it('should remove path node', () => {
        const path = '$..children[?(@.path=="/pet/{petId}")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = openApiEditor.removeNode(inputNode.jsonPointer);

        jsonPath.query(result, path).should.be.empty;
        shouldBeValidDoc(openApiEditor.getDocument());
        openApiEditor.getDocument().paths.should.not.haveOwnProperty(path);
        result.should.be.deep.equal(openApiEditor.parse());
      });

      it('should remove endpoint node', () => {
        const path =
          '$..children[?(@.path=="/pet/{petId}" && @.method=="GET")]';
        const inputNode: SpecTreeNode = jsonPath.query(inputTree, path)[0];

        const result = openApiEditor.removeNode(inputNode.jsonPointer);

        jsonPath.query(result, path).should.be.empty;
        shouldBeValidDoc(openApiEditor.getDocument());
        openApiEditor
          .getDocument()
          .paths['/pet/{petId}'].should.not.haveOwnProperty('get');
        result.should.be.deep.equal(openApiEditor.parse());
      });
    });

    describe('stringify', () => {
      it('should serialize yaml into yaml', () => {
        const result = openApiEditor.stringify();

        result.should.be.a('string');
        result.should.match(/^openapi:/);
      });

      it('should serialize json into json', async () => {
        await openApiEditor.setup('{}');

        const result = openApiEditor.stringify();

        result.should.be.a('string');
        result.should.equal('{}');
      });
    });
  });
});