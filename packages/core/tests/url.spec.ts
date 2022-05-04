import {
  normalizeUrl,
  removeLeadingSlash,
  parseUrl,
  validateUrl
} from '../src';

describe('url', () => {
  describe('normalizeUrl', () => {
    [
      { input: 'http://example.com/', output: 'http://example.com' },
      { input: 'http://example.com//', output: 'http://example.com' },
      { input: '//example.com', output: 'https://example.com' },
      { input: 'example.com/path', output: 'https://example.com/path' },
      {
        input: 'http://////example.com',
        output: 'http://example.com'
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
        expect(result).toEqual(output);
      })
    );
  });

  describe('validateUrl', () => {
    [
      'http://foo.com/blah_blah',
      'http://foo.com/blah_blah/',
      'http://foo.com/blah_blah_(wikipedia)',
      'http://foo.com/blah_blah_(wikipedia)_(again)',
      'http://www.example.com/wpstyle/?p=364',
      'https://www.example.com/foo/?bar=baz&inga=42&quux',
      'http://✪df.ws/123',
      'http://userid:password@example.com:8080',
      'http://userid:password@example.com:8080/',
      'http://userid@example.com',
      'http://userid@example.com/',
      'http://userid@example.com:8080',
      'http://userid@example.com:8080/',
      'http://userid:password@example.com',
      'http://userid:password@example.com/',
      'http://142.42.1.1/',
      'http://142.42.1.1:8080/',
      'http://➡.ws/䨹',
      'http://⌘.ws',
      'wss://example.com/',
      'http://foo.com/blah_(wikipedia)#cite-1',
      'http://foo.com/blah_(wikipedia)_blah#cite-1',
      'http://foo.com/unicode_(✪)_in_parens',
      'http://foo.com/(something)?after=parens',
      'http://☺.damowmow.com/',
      'http://code.google.com/events/#&product=browser',
      'http://j.mp',
      'ftp://foo.bar/baz',
      'http://foo.bar/?q=Test%20URL-encoded%20stuff',
      'http://مثال.إختبار',
      'http://例子.测试',
      'http://उदाहरण.परीक्षा',
      "http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com",
      'http://1337.net',
      'http://a.b-c.de',
      'http://a.b--c.de/',
      'http://www.foo.bar./',
      'http://223.255.255.254',
      'http://www.example.com.',
      'http://www.example.com/',
      'http://www.example.com?',
      'http://www.example.com#',
      'http://www.example.com./?#',
      'http:///a',
      'http://www.example.com',
      'ws://www.example.com',
      'wss://www.example.com',
      'ftp://www.example.com'
    ].forEach((input) =>
      it(`should return true for ${input}`, () => {
        // act
        const result = validateUrl(input);

        // assert
        expect(result).toEqual(true);
      })
    );

    [
      'http://',
      'http://?',
      'http://??',
      'http://??/',
      'http://#',
      'http://##',
      'http://##/',
      'kkk://',
      '//',
      '//a',
      '///a',
      '///',
      'foo.com',
      'http:// shouldfail.com',
      ':// should fail',
      'rat://www.example.com',
      'blob:http://www.example.com'
    ].forEach((input) =>
      it(`should return false for ${input}`, () => {
        // act
        const result = validateUrl(input);

        // assert
        expect(result).toEqual(false);
      })
    );
  });

  describe('removeLeadingSlash', () => {
    it(`should remove leading slash`, () => {
      // act
      const result = removeLeadingSlash('/path/input');

      // assert
      expect(result).toEqual('path/input');
    });

    it(`should remove only one leading slash`, () => {
      // act
      const result = removeLeadingSlash('//path/input');

      // assert
      expect(result).toEqual('/path/input');
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
        expect(result[key]).toEqual(expected[key])
      );
    });

    it(`should raise an exception while encountering opaque origin`, () => {
      // arrange
      const input =
        'ttp://user:password@example.com:456/pets/cats?limit=10&offset=10#first';

      // act
      expect(() => parseUrl(input)).toThrowError(TypeError);
    });

    it(`should raise an exception if hostname is empty string`, () => {
      // arrange
      const input = 'kkk://';

      // act
      expect(() => parseUrl(input)).toThrowError(TypeError);
    });
  });
});
