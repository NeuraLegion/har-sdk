import { Parser } from './Parser';
import { transformBinaryToUtf8 } from '../utils';
import { Response } from 'request';
import { URL } from 'url';

export class DefaultParser implements Parser {
  public parseHttpVersion(response: Response): string {
    const version = (response && response.httpVersion) || null;

    return version ? `HTTP/${version}` : 'unknown';
  }

  public parseRedirectUrl(
    response: Response
  ): [Record<string, string> | null, string] {
    if (response && response.statusCode >= 300 && response.statusCode < 400) {
      let location = transformBinaryToUtf8(response.headers['location']);

      if (location) {
        location = decodeURIComponent(location);

        const hasRelativeProtocol = location.startsWith('//');
        const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(location);
        const base = response.request.uri;

        // eslint-disable-next-line max-depth
        try {
          return [
            null,
            isRelativeUrl
              ? new URL(location, base.href).href
              : new URL(location).href
          ];
        } catch (err) {
          return [
            {
              message: (err as Error).message,
              code: 'INVALID_REDIRECT_URL'
            },
            ''
          ];
        }
      }
    }

    return [
      {
        message: 'Missing location header',
        code: 'NOLOCATION'
      },
      ''
    ];
  }
}
