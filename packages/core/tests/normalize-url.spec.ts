import 'chai/register-should';
import { normalizeUrl } from '../src/utils';

describe('normalizeUrl', () => {
  [
    { input: 'http://example.com/', output: 'http://example.com' },
    { input: 'http://example.com//', output: 'http://example.com' },
    { input: '//example.com', output: 'https://example.com' },
    { input: 'example.com/path', output: 'https://example.com/path' },
    {
      input: 'http://example.com/pets/?offset=10&limit=10',
      output: 'http://example.com/pets?limit=10&offset=10'
    },
    {
      input: 'http://example.com/pets/?offset=10&limit=10',
      output: 'http://example.com/pets?limit=10&offset=10'
    },
    {
      input: 'HTTP://example.com',
      output: 'http://example.com'
    },
    {
      input: 'HTTP://EXAMPLE.COM/PATH',
      output: 'http://example.com/PATH'
    },
    {
      input: 'http://example.com/?',
      output: 'http://example.com'
    },
    {
      input: 'http://example.com/foo/bar/../baz',
      output: 'http://example.com/foo/baz'
    },
    {
      input: 'http://example.com////foo////bar',
      output: 'http://example.com/foo/bar'
    },
    {
      input: 'https://user:password@example.com',
      output: 'https://user:password@example.com'
    }
  ].forEach(({ input, output }) =>
    it(`should return ${output} for ${input}`, () => {
      // act
      const result = normalizeUrl(input);

      // assert
      result.should.eq(output);
    })
  );
});
