import { DefaultOperations } from '../src/converter/operations/DefaultOperations';
import { GraphQLFixture } from './GraphQLFixture';

describe('DefaultGraphQLOperations', () => {
  const graphQLFixture = new GraphQLFixture();

  let sut!: DefaultOperations;

  beforeEach(() => {
    sut = new DefaultOperations();
  });

  describe('create', () => {
    it.each([
      {
        test: 'UPLOAD output',
        input: {
          fileNames: ['file-upload'],
          options: { skipExternalizedVariables: true, skipInPlaceValues: true }
        },
        expected: 'file-upload.result'
      },
      {
        test: 'UNION output with externalized variables',
        input: {
          fileNames: ['output-selector.union', 'star-wars.models'],
          options: { skipInPlaceValues: true }
        },
        expected: 'output-selector.union.variables.result'
      },
      {
        test: 'LIST input with externalized variables',
        input: {
          fileNames: ['input-sampler.list', 'star-wars.models'],
          options: { skipInPlaceValues: true }
        },
        expected: 'input-sampler.list.variables.result'
      },
      {
        test: 'INPUT_OBJECT input with externalized variables',
        input: {
          fileNames: ['input-sampler.input-object', 'star-wars.models'],
          options: { skipInPlaceValues: true }
        },
        expected: 'input-sampler.input-object.variables.result'
      },
      {
        test: 'ENUM input with externalized variables',
        input: {
          fileNames: ['input-sampler.enum', 'star-wars.models'],
          options: { skipInPlaceValues: true }
        },
        expected: 'input-sampler.enum.variables.result'
      },
      {
        test: 'builtin SCALAR input with externalized variables',
        input: {
          fileNames: ['input-sampler.builtin-scalar'],
          options: { skipInPlaceValues: true }
        },
        expected: 'input-sampler.builtin-scalar.variables.result'
      },
      {
        test: 'OBJECT output with externalized variables',
        input: {
          fileNames: ['output-selector.object', 'star-wars.models'],
          options: { skipInPlaceValues: true }
        },
        expected: 'output-selector.object.variables.result'
      },
      {
        test: 'INTERFACE output with externalized variables',
        input: {
          fileNames: ['output-selector.interface', 'star-wars.models'],
          options: { skipInPlaceValues: true }
        },
        expected: 'output-selector.interface.variables.result'
      },
      {
        test: 'UNION output with in place arguments',
        input: {
          fileNames: ['output-selector.union', 'star-wars.models'],
          options: { skipExternalizedVariables: true }
        },
        expected: 'output-selector.union.in-place.result'
      },
      {
        test: 'LIST input with in place arguments',
        input: {
          fileNames: ['input-sampler.list', 'star-wars.models'],
          options: { skipExternalizedVariables: true }
        },
        expected: 'input-sampler.list.in-place.result'
      },
      {
        test: 'INPUT_OBJECT input with in place arguments',
        input: {
          fileNames: ['input-sampler.input-object', 'star-wars.models'],
          options: { skipExternalizedVariables: true }
        },
        expected: 'input-sampler.input-object.in-place.result'
      },
      {
        test: 'ENUM input with in place arguments',
        input: {
          fileNames: ['input-sampler.enum', 'star-wars.models'],
          options: { skipExternalizedVariables: true }
        },
        expected: 'input-sampler.enum.in-place.result'
      },
      {
        test: 'builtin SCALAR input with in place arguments',
        input: {
          fileNames: ['input-sampler.builtin-scalar'],
          options: { skipExternalizedVariables: true }
        },
        expected: 'input-sampler.builtin-scalar.in-place.result'
      },
      {
        test: 'OBJECT output with in place arguments',
        input: {
          fileNames: ['output-selector.object', 'star-wars.models'],
          options: { skipExternalizedVariables: true }
        },
        expected: 'output-selector.object.in-place.result'
      },
      {
        test: 'INTERFACE output with in place arguments',
        input: {
          fileNames: ['output-selector.interface', 'star-wars.models'],
          options: { skipExternalizedVariables: true }
        },
        expected: 'output-selector.interface.in-place.result'
      }
    ])(
      'should convert $test',
      async ({ input, expected: expectedFileName }) => {
        // arrange
        const { input: inputEnvelope, expected } = await graphQLFixture.create({
          ...input,
          expectedFileName
        });

        // act
        const result = sut.create(inputEnvelope.data, input.options);

        // assert
        expect(result).toStrictEqual(expected);
      }
    );

    it.each([
      {
        test: 'DVGA  with in place arguments',
        input: {
          fileNames: ['dvga'],
          options: {
            skipExternalizedVariables: true,
            operationCostThreshold: 10
          }
        },
        expected: 'dvga.in-place.result'
      },
      {
        test: 'DVGA  with externalized variables',
        input: {
          fileNames: ['dvga'],
          options: { skipInPlaceValues: true, operationCostThreshold: 10 }
        },
        expected: 'dvga.variables.result'
      },
      {
        test: 'https://countries.trevorblades.com  with in place arguments',
        input: {
          fileNames: ['trevorblades'],
          options: {
            skipExternalizedVariables: true,
            operationCostThreshold: 10
          }
        },
        expected: 'trevorblades.in-place.result'
      },
      {
        test: 'https://countries.trevorblades.com  with externalized variables',
        input: {
          fileNames: ['trevorblades'],
          options: { skipInPlaceValues: true, operationCostThreshold: 10 }
        },
        expected: 'trevorblades.variables.result'
      }
    ])(
      'should convert 3rd party specification $test',
      async ({ input: { fileNames, options }, expected: expectedFileName }) => {
        // arrange
        const { input: inputEnvelope, expected } = await graphQLFixture.create({
          fileNames,
          expectedFileName
        });

        // act
        const result = sut.create(inputEnvelope.data, options);

        // assert
        expect(result).toStrictEqual(expected);
      }
    );
  });
});
