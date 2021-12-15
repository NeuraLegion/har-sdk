import { URL } from 'url';

export const removeTrailingSlash = (path: string): string =>
  path.replace(/\/$/, '');

export const removeLeadingSlash = (path: string): string =>
  path.replace(/^\//, '');

const normalizePathName = (pathname: string): string =>
  decodeURI(
    removeTrailingSlash(
      pathname.replace(/((?!:).|^)\/{2,}/g, (_: string, p1: string) =>
        /^(?!\/)/g.test(p1) ? `${p1}/` : '/'
      )
    )
  );

const DEFAULT_PROTOCOL = 'https';

export const normalizeUrl = (urlString: string): string => {
  const hasRelativeProtocol = urlString.startsWith('//');
  const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

  if (!isRelativeUrl) {
    urlString = urlString.replace(
      /^(?!(?:\w+:)?\/\/)|^\/\//,
      `${DEFAULT_PROTOCOL}://`
    );
  }

  const url = new URL(urlString);

  if (url.pathname) {
    try {
      url.pathname = normalizePathName(url.pathname);
    } catch {
      // noop
    }
  }

  if (url.searchParams) {
    url.searchParams.sort();
  }

  if (url.hostname) {
    url.hostname = url.hostname.replace(/\.$/, '');
  }

  urlString = url.toString();

  if (url.pathname === '/' && url.hash === '') {
    urlString = removeTrailingSlash(urlString);
  }

  return urlString;
};
