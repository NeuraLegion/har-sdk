export class Base64 {
  private static readonly encoder =
    typeof TextEncoder === 'function' ? new TextEncoder() : undefined;

  public static encode(value: string): string {
    if (typeof btoa === 'function') {
      return btoa(this.normalize(value));
    } else if (typeof Buffer === 'function') {
      return Buffer.from(value).toString('base64');
    } else {
      throw new Error(
        'Unable to find either btoa or Buffer in the global scope.'
      );
    }
  }

  // ADHOC: Intended to translate UTF-16 encoded characters to UTF-8 format.
  // For example, passing the string '✓ à la mode' to `btoa` will result in the error
  // "DOMException [InvalidCharacterError]: Invalid character".
  // For details please refer to https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
  private static normalize(x: string): string {
    return this.encoder
      ? String.fromCharCode(...this.encoder.encode(x))
      : unescape(encodeURIComponent(x));
  }
}
