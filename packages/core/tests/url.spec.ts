import 'chai/register-should';
import { normalizeUrl, removeLeadingSlash, parseUrl } from '../src';

describe('url', () => {
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
      },
      {
        input: 'HTTP://example.COM////foo////dummy/../bar/?',
        output: 'http://example.com/foo/bar'
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

  describe('removeLeadingSlash', () => {
    it(`should remove leading slash`, () => {
      // act
      const result = removeLeadingSlash('/path/input');

      // assert
      result.should.eq('path/input');
    });

    it(`should remove only one leading slash`, () => {
      // act
      const result = removeLeadingSlash('//path/input');

      // assert
      result.should.eq('/path/input');
    });
  });

  describe('parseUrl', () => {
    it(`should parse url`, () => {
      // arrange
      const input =
        'https://user:password@example.com:456/pets/cats?limit=10&offset=10#first';
      const expected = {
        hash: '#first',
        host: 'example.com:456',
        hostname: 'example.com',
        href: input,
        origin: 'https://example.com:456',
        password: 'password',
        pathname: '/pets/cats',
        port: '456',
        protocol: 'https:',
        search: '?limit=10&offset=10',
        username: 'user'
      };

      // act
      const result = parseUrl(input);

      // assert
      Object.keys(expected).forEach((key) =>
        result[key].should.eq(expected[key])
      );
    });
  });
});
