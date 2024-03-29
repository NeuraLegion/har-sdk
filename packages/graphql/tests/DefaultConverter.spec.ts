import { GraphQLFixture } from './GraphQLFixture';
import { DefaultConverter } from '../src/converter/DefaultConverter';

describe('DefaultConverter', () => {
  const graphQLFixture = new GraphQLFixture();

  let sut!: DefaultConverter;

  beforeEach(() => {
    sut = new DefaultConverter();
  });

  describe('convert', () => {
    it.each([
      {
        test: 'brokencrystals',
        input: {
          url: 'https://brokencrystals.com/graphql',
          fileNames: ['brokencrystals']
        },
        expectedFileName: 'brokencrystals.har-requests.result'
      },
      {
        test: 'file-upload',
        input: {
          url: 'https://example.com/graphql',
          fileNames: ['file-upload']
        },
        expectedFileName: 'file-upload.har-requests.result'
      }
    ])('should convert $test', async ({ input, expectedFileName }) => {
      // arrange
      const { expected, input: inputDocument } = await graphQLFixture.create({
        expectedFileName,
        ...input
      });

      // act
      const result = await sut.convert(inputDocument, {});

      // assert
      expect(result).toStrictEqual(expected);
    });
  });
});
