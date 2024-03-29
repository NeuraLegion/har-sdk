import { GraphQL } from '@har-sdk/core';
import { introspectionFromSchema } from 'graphql';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

export class GraphQLFixture {
  public async create({
    fileNames,
    url = 'https://example.com/graphql',
    expectedFileName
  }: {
    fileNames: string[];
    expectedFileName: string;
    url?: string;
  }) {
    const inputFilePath = resolve(__dirname, `./fixtures`);

    const expectedContent = await promisify(readFile)(
      `${inputFilePath}/${expectedFileName}.json`,
      'utf-8'
    );

    const input = await this.createFromSDL({ fileNames, url });

    const inputContent = JSON.stringify(input);

    return {
      input,
      inputContent,
      expected: JSON.parse(expectedContent)
    };
  }

  public async createFromSDL({
    fileNames,
    url = 'https://exmaple.com/graphql'
  }: {
    fileNames: string | string[];
    url?: string;
  }) {
    const inputFilePath = resolve(__dirname, `./fixtures`);

    fileNames = Array.isArray(fileNames) ? fileNames : [fileNames];

    const schema = await loadSchema(
      fileNames.map((name) => `${inputFilePath}/${name}.graphql`),
      {
        loaders: [new GraphQLFileLoader()]
      }
    );

    return {
      url,
      data: introspectionFromSchema(schema)
    } as GraphQL.Document;
  }
}
