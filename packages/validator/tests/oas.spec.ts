import githubSwagger from './github_swagger.json';
import { OASValidator, Validator } from '../src';
import yaml from 'js-yaml';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';
import { resolve } from 'path';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

describe('OpenApi', async () => {
  const validator: Validator = new OASValidator();

  it('GitHub swagger v2 JSON', async () => {
    await validator.verify(githubSwagger as unknown as OpenAPIV2.Document);
  });

  it('Petstore OpenApi v3 YAML', async () => {
    const content: string = await readFile(
      resolve('./tests/petstore_oas.yaml'),
      'utf8'
    );

    await validator.verify(yaml.load(content) as OpenAPIV3.Document);
  });
});
