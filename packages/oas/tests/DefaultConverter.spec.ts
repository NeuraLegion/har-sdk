import githubSwagger from './fixtures/github.swagger.json';
import { oas2har } from '../src';
import yaml from 'js-yaml';
import { OpenAPIV2, OpenAPIV3, Request } from '@har-sdk/core';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import 'chai/register-should';

describe('DefaultConverter', () => {
  describe('convert', () => {
    it('should convert GitHub OAS v2 (JSON) to HAR', async () => {
      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/github.swagger.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        githubSwagger as unknown as OpenAPIV2.Document
      );

      result.should.deep.eq(expected);
    });

    it('should convert Petstore OAS v3 (YAML) to HAR', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/petstore.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/petstore.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });

    it('should generate multipart/form-data according to OAS definition', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/multipart.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/multipart.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });

    it('should convert OAS v3 spec even if parameters are declared via ref', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/refs.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/refs.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });

    it('should substitute variables in servers', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/servers-with-variables.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/servers-with-variables.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });
  });
});
