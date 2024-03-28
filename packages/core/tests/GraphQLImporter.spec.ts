import { GraphQLImporter } from '../src/importers/GraphQLImporter';
import { readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

describe('GraphQLImporter', () => {
  const readFileAsync = promisify(readFile);

  let sut!: GraphQLImporter;

  beforeEach(() => {
    sut = new GraphQLImporter();
  });

  describe('type', () => {
    it(`should return graphql`, () => {
      // act
      const result = sut.type;

      // assert
      expect(result).toStrictEqual('graphql');
    });
  });

  describe('import', () => {
    it('should not import unparsable content ', async () => {
      // arrange
      const content = '{';

      // act
      const spec = await sut.import(content);

      // assert
      expect(spec).toBeUndefined();
    });

    it('should import introspection envelope', async () => {
      // arrange
      const input = await promisify(readFile)(
        resolve(__dirname, './fixtures/graphql.json'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/graphql.result.json'),
          'utf8'
        )
      );

      // act
      const spec = await sut.import(input);

      // assert
      expect(spec).toMatchObject({
        doc: expected,
        format: 'json',
        type: 'graphql',
        name: 'example.com-c00f7d6a02b8e2fb143fd737b7302c15'
      });
    });

    it('should import SDL envelope', async () => {
      // arrange
      const input = JSON.stringify({
        url: 'https://example.com/graphql',
        data: [
          await readFileAsync(
            resolve(__dirname, './fixtures/graphql.graphql'),
            'utf-8'
          )
        ]
      });

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/graphql.result.json'),
          'utf8'
        )
      );

      // act
      const spec = await sut.import(input);

      // assert
      expect(spec).toMatchObject({
        doc: expected,
        format: 'json',
        type: 'graphql',
        name: 'example.com-c00f7d6a02b8e2fb143fd737b7302c15'
      });
    });
  });
});
