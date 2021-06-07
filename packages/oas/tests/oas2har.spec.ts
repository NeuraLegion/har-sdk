import githubSwagger from './github_swagger.json';
import { oas2har } from '../src';
import yaml from 'js-yaml';
import Har from 'har-format';
import { expect } from 'chai';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { resolve } from 'path';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

describe('OAS 2 HAR', async () => {
  it('GitHub swagger v2 JSON to HAR', async () => {
    const [firstRequest]: Har.Request[] = await oas2har(
      githubSwagger as unknown as OpenAPIV2.Document
    );

    expect(firstRequest.method).to.equal('GET');
    expect(firstRequest.url).to.equal('https://api.github.com/emojis');
    expect(firstRequest.httpVersion).to.equal('HTTP/1.1');
  });

  it('Petstore OpenApi v3 YAML to JSON converts to HAR', async () => {
    const content: string = await readFile(
      resolve('./tests/petstore_oas.yaml'),
      'utf8'
    );

    const [firstRequest]: Har.Request[] = await oas2har(
      yaml.load(content) as OpenAPIV3.Document
    );

    expect(firstRequest.method).to.equal('PUT');
    expect(firstRequest.url).to.equal('https://petstore.swagger.io/v2/pet');
    expect(firstRequest.httpVersion).to.equal('HTTP/1.1');
  });
});
