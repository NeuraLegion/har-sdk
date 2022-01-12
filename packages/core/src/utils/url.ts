const URL =
  typeof (global as any).window !== 'undefined'
    ? (global as any).window.URL
    : // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('url').URL;

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

const prependProtocolIfNecessary = (url: string): string => {
  const hasRelativeProtocol = /^\/{2}/.test(url);
  const isRelativeUrl = !hasRelativeProtocol && /^\.+\//.test(url);

  if (!isRelativeUrl) {
    url = url.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, `${DEFAULT_PROTOCOL}://`);
  }

  return url;
};

export const normalizeUrl = (value: string): string => {
  const url = new URL(prependProtocolIfNecessary(value));

  try {
    url.pathname = normalizePathName(url.pathname);
  } catch {
    // noop
  }

  url.searchParams.sort();
  url.hostname = url.hostname.replace(/\.$/, '');

  let urlString = url.toString();

  if (url.pathname === '/' && url.hash === '') {
    urlString = removeTrailingSlash(urlString);
  }

  return urlString;
};

export const parseUrl = (value: string): typeof URL => new URL(value);
