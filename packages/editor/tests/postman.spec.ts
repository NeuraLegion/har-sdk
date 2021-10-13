import { TreeParser, PostmanEditor } from '../src';

import 'chai/register-should';
import { PostmanValidator } from '@har-sdk/validator';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

use(chaiAsPromised);

describe('oas parser', () => {
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
});
