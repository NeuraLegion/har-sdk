import { OASValidator } from '../src/validator/OASValidator';
import { OpenAPIV3 } from '@har-sdk/core';
import yaml from 'js-yaml';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('OASValidator - real world specifications', () => {
  const validator = new OASValidator();

  const readDirectory = (dir: string) =>
    fs.readdirSync(dir).flatMap((file) => path.join(dir, file));

  describe('verify', () => {
    it.each([
      ...readDirectory(resolve(__dirname, './fixtures/real-world/valid'))
    ])('should validate oas.3.1 %s', async (input) => {
      const spec: OpenAPIV3.Document = yaml.load(
        await promisify(readFile)(input, 'utf8')
      ) as OpenAPIV3.Document;

      spec.servers = [
        {
          url: 'https://example.com'
        }
      ];

      const result = await validator.verify(spec);

      expect(result).toEqual([]);
    });
  });

  it.failing.each([
    ...readDirectory(resolve(__dirname, './fixtures/real-world/invalid'))
  ])('should not validate oas.3.1 %s', async (input) => {
    const spec: OpenAPIV3.Document = yaml.load(
      await promisify(readFile)(input, 'utf8')
    ) as OpenAPIV3.Document;

    spec.servers = [
      {
        url: 'https://example.com'
      }
    ];

    const result = await validator.verify(spec);

    expect(result).toEqual([]);
  });
});
