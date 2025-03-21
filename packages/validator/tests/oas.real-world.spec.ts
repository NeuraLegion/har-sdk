import { OASValidator } from '../src/validator/OASValidator';
import { OpenAPIV3 } from '@har-sdk/core';
import yaml from 'js-yaml';
import { resolve } from 'node:path';
import { readFile, readdirSync } from 'node:fs';
import { promisify } from 'node:util';

describe('OASValidator', () => {
  const validator = new OASValidator();

  const readDirectory = (dir: string) =>
    readdirSync(dir).flatMap((file) => resolve(dir, file));

  describe('verify', () => {
    it.each([
      ...readDirectory(resolve(__dirname, './fixtures/real-world/valid'))
    ])('should successfully validate OAS 3.1 (%s)', async (input) => {
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

    it.failing.each([
      ...readDirectory(resolve(__dirname, './fixtures/real-world/invalid'))
    ])('should fail validation validate OAS 3.1 (%s)', async (input) => {
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
});
