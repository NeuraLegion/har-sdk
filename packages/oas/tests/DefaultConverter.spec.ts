import githubSwagger from './fixtures/github.swagger.json';
import { oas2har } from '../src';
import yaml from 'js-yaml';
import Har from 'har-format';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import 'chai/register-should';

describe('DefaultConverter', () => {
  describe('convert', () => {
    it('should convert GitHub OAS v2 (JSON) to HAR', async () => {
      const [firstRequest]: Har.Request[] = await oas2har(
        githubSwagger as unknown as OpenAPIV2.Document
      );

      firstRequest.method.should.equal('GET');
      firstRequest.url.should.equal('https://api.github.com/emojis');
      firstRequest.httpVersion.should.equal('HTTP/1.1');
    });

    it('should convert Petstore OAS v3 (YAML) to HAR', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/petstore.oas.yaml'),
        'utf8'
      );

      const [firstRequest]: Har.Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      firstRequest.method.should.equal('PUT');
      firstRequest.url.should.equal('https://petstore.swagger.io/v2/pet');
      firstRequest.httpVersion.should.equal('HTTP/1.1');
    });

    it('should generate multipart/form-data according to OAS definition', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/multipart.oas.yaml'),
        'utf8'
      );

      const [firstRequest]: Har.Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      firstRequest.method.should.equal('PUT');
      firstRequest.url.should.equal('https://petstore.swagger.io/v2/pet');
      firstRequest.postData?.mimeType.should.contain('multipart/form-data');
    });

    it('should convert OAS v3 spec even if parameters are declared via ref', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/refs.oas.yaml'),
        'utf8'
      );

      const [firstRequest]: Har.Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      firstRequest.method.should.equal('GET');
      firstRequest.url.should.equal(
        'https://petstore.swagger.io/v2/pets?query=doggie&limit=500'
      );
      firstRequest.queryString.should.have.deep.members([
        { name: 'query', value: 'doggie' },
        { name: 'limit', value: '500' }
      ]);
    });
  });
});
