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

// eslint-disable-next-line complexity
export const normalizeUrl = (value: string): string => {
  let urlString = prependProtocolIfNecessary(value);
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
