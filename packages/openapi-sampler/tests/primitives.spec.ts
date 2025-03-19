import { sample } from '../src';

describe('Primitives', () => {
  it('should sample deterministic string', () => {
    const schema = {
      type: 'string'
    };
    const result = sample(schema);
    expect(result).toEqual('lorem');
  });

  it('should sample deterministic boolean', () => {
    const schema = {
      type: 'boolean'
    };
    const result = sample(schema);
    expect(result).toEqual(true);
  });

  it('should use default property', () => {
    const schema = {
      type: 'number',
      default: 100
    };
    const result = sample(schema);
    expect(result).toEqual(100);
  });

  it('should use null if type is not specified', () => {
    const schema = {};
    const result = sample(schema);
    expect(!result).toBe(true);
  });

  it.each([
    {
      input: { type: ['string', 'null'] },
      expected: 'lorem'
    },
    {
      input: { type: ['null', 'string'] },
      expected: 'lorem'
    },
    {
      input: { type: ['null'] },
      expected: null
    },
    {
      input: { type: [''] },
      expected: null
    },
    {
      input: {},
      expected: null
    }
  ])('should correctly handle nullable %j', ({ input, expected }) => {
    //act
    const result = sample(input);

    // assert
    expect(result).toEqual(expected);
  });
});
