import { decodeReserved } from '../src/utils/decodeReserved';

describe('decodeReserved', () => {
  it.each([
    { input: '%21', expected: '!' },
    { input: '%23', expected: '#' },
    { input: '%24', expected: '$' },
    { input: '%26', expected: '&' },
    { input: '%27', expected: "'" },
    { input: '%28', expected: '(' },
    { input: '%29', expected: ')' },
    { input: '%2A', expected: '*' },
    { input: '%2B', expected: '+' },
    { input: '%2C', expected: ',' },
    { input: '%2F', expected: '/' },
    { input: '%3A', expected: ':' },
    { input: '%3B', expected: ';' },
    { input: '%3D', expected: '=' },
    { input: '%3F', expected: '?' },
    { input: '%40', expected: '@' },
    { input: '%5B', expected: '[' },
    { input: '%5D', expected: ']' },
    {
      input: '%E2%99%A5',
      expected: '%E2%99%A5'
    },
    {
      input: '%F0%9F%8D%A3',
      expected: '%F0%9F%8D%A3'
    },
    {
      input:
        '%F0%9F%91%A9%E2%80%8D%F0%9F%91%A9%E2%80%8D%F0%9F%91%A7%E2%80%8D%F0%9F%91%A7',
      expected:
        '%F0%9F%91%A9%E2%80%8D%F0%9F%91%A9%E2%80%8D%F0%9F%91%A7%E2%80%8D%F0%9F%91%A7'
    },
    {
      input: '%E2%99%A5%F0%9F%8D%A3',
      expected: '%E2%99%A5%F0%9F%8D%A3'
    }
  ])('should decode $input to $expected ', ({ input, expected }) => {
    // act
    const result = decodeReserved(input);
    // assert
    expect(result).toEqual(expected);
  });
});
