import { Base64 } from '../src/utils';

describe('Base64', () => {
  const encodedUtf16 = '4pyTIMOgIGxhIG1vZGU=';
  const encodedUtf8 = 'SGVsbG8sIHdvcmxkIQ==';
  const plainUtf8 = 'Hello, world!';
  const plainUtf16 = '✓ à la mode';

  const originalAtob = global.atob;
  const originalBtoA = global.btoa;
  const originalBuffer = global.Buffer;

  afterEach(() => {
    global.atob = originalAtob;
    global.btoa = originalBtoA;
    global.Buffer = originalBuffer;
  });

  describe('encode', () => {
    it.each([
      { input: plainUtf8, expected: encodedUtf8, label: 'utf8' },
      { input: plainUtf16, expected: encodedUtf16, label: 'utf16' }
    ])('should encode $label string using btoa', ({ input, expected }) => {
      // act
      const result = Base64.encode(input);

      // assert
      expect(result).toEqual(expected);
    });

    it.each([
      { input: plainUtf8, expected: encodedUtf8, label: 'utf8' },
      { input: plainUtf16, expected: encodedUtf16, label: 'utf16' }
    ])('should encode $label string using Buffer', ({ input, expected }) => {
      // arrange
      global.btoa = undefined;

      // act
      const result = Base64.encode(input);

      // assert
      expect(result).toEqual(expected);
    });

    it('should throw an error if btoa and Buffer are not found', () => {
      // arrange
      global.btoa = undefined;
      global.Buffer = undefined;

      // act
      const act = () => Base64.encode(plainUtf8);

      // assert
      expect(act).toThrowError(
        'Unable to find either btoa or Buffer in the global scope.'
      );
    });
  });
});
