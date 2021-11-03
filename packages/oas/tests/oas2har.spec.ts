import githubSwagger from './github.swagger.json';
import { oas2har } from '../src';
import yaml from 'js-yaml';
import Har from 'har-format';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import 'chai/register-should';

describe('OAS 2 HAR', async () => {
  it('GitHub swagger v2 JSON to HAR', async () => {
    const [firstRequest]: Har.Request[] = await oas2har(
      githubSwagger as unknown as OpenAPIV2.Document
    );

    firstRequest.method.should.equal('GET');
    firstRequest.url.should.equal('https://api.github.com/emojis');
    firstRequest.httpVersion.should.equal('HTTP/1.1');
  });

  it('Petstore OpenApi v3 YAML to JSON converts to HAR', async () => {
    const content: string = await promisify(readFile)(
      resolve('./tests/oas3.petstore.yaml'),
      'utf8'
    );

    const [firstRequest]: Har.Request[] = await oas2har(
      yaml.load(content) as OpenAPIV3.Document
    );

    firstRequest.method.should.equal('PUT');
    firstRequest.url.should.equal('https://petstore.swagger.io/v2/pet');
    firstRequest.httpVersion.should.equal('HTTP/1.1');
  });

  it('should generate multipart/form-data according to OAS', async () => {
    const content: string = await promisify(readFile)(
      resolve('./tests/multipart-requests.oas.yaml'),
      'utf8'
    );

    const [firstRequest]: Har.Request[] = await oas2har(
      yaml.load(content) as OpenAPIV3.Document
    );

    firstRequest.method.should.equal('PUT');
    firstRequest.url.should.equal('https://petstore.swagger.io/v2/pet');
    firstRequest.postData?.mimeType.should.contain('multipart/form-data');
  });
});
