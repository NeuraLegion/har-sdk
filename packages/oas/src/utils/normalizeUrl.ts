import { URL } from 'url';

const DEFAULT_PROTOCOL = 'https';

export const normalizeUrl = (urlString: string): string => {
  const hasRelativeProtocol = urlString.startsWith('//');
  const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

  if (!isRelativeUrl) {
    urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, DEFAULT_PROTOCOL);
  }

  const url: URL = new URL(urlString);

  if (url.pathname) {
    url.pathname = url.pathname
      .replace(/(?<!https?:)\/{2,}/g, '/')
      .replace(/\/$/, '');

    try {
      url.pathname = decodeURI(url.pathname);
    } catch {
      // noop
    }
  }

  if (url.hostname) {
    url.hostname = url.hostname.replace(/\.$/, '');
  }

  urlString = url.toString();

  if (url.pathname === '/' && url.hash === '') {
    urlString = urlString.replace(/\/$/, '');
  }

  return urlString;
};
