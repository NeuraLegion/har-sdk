import { Capture } from './Capture';
import { Parser } from '../parser';
import { HarBuilder, HarEntry, Options } from '../builder';
import * as Request from 'request';
import requestPromise from 'request-promise';
import net from 'net';
import { parse as urlParse } from 'url';
import dns from 'dns';

export class DefaultCapture implements Capture {
  private dnsCache: Record<string, string> = {};

  constructor(
    private readonly builder: HarBuilder,
    private readonly parser: Parser
  ) {}

  public async captureEntries(
    requestConfig: Request.OptionsWithUrl,
    harConfig: Options,
    depth: number = 1
  ): Promise<HarEntry[]> {
    let startTime = Date.now();
    let startHrtime = process.hrtime();

    return this.capturePromiseEntry(requestConfig, harConfig).then(
      ([request, error, response, remoteAddress]: [
        Request.Request,
        any,
        Request.Response,
        string
      ]) => {
        const [isRedirect, redirectError, redirectUrl]: [
          boolean,
          Record<string, string> | null,
          string
        ] = this.shouldRedirect(response, requestConfig, depth);
        error = error || redirectError;

        const req = (response && response.request) || request;
        const entry = this.builder.buildHarEntry({
          request: req,
          error,
          response,
          harConfig,
          redirectUrl,
          meta: {
            startTime,
            remoteAddress,
            duration: this.hrtimeToMilliseconds(process.hrtime(startHrtime))
          }
        });

        startTime = Date.now();
        startHrtime = process.hrtime();

        if (isRedirect) {
          const redirectConfig = Object.assign({}, requestConfig, {
            url: entry.response.redirectURL
          });

          const customHostHeaderName = this.getCustomHostHeaderName(
            requestConfig
          );

          if (customHostHeaderName) {
            redirectConfig.headers[customHostHeaderName] = urlParse(
              entry.response.redirectURL
            ).host;
          }

          return this.captureEntries(
            redirectConfig,
            harConfig,
            depth + 1
          ).then((entries) => [entry].concat(entries));
        } else {
          return [entry];
        }
      }
    );
  }

  private async capturePromiseEntry(
    requestConfig: Request.OptionsWithUrl,
    harConfig: Options
  ): Promise<[Request.Request, any, Request.Response, string]> {
    const dnsCache = this.dnsCache;

    const options = Object.assign({}, requestConfig, {
      resolveWithFullResponse: true,
      simple: false,
      followRedirect: false,
      lookup(
        host: string,
        opts: Record<string, any>,
        cb: (err: any, ip: string, addressType: string) => any
      ) {
        const lookupFn = (requestConfig as any).lookup || dns.lookup;

        return lookupFn(
          host,
          opts,
          (err: any, ip: string, addressType: string) => {
            dnsCache.remoteAddress = ip;
            cb(err, ip, addressType);
          }
        );
      }
    });

    const reqObject = requestPromise(options);

    reqObject.on('response', (res) => {
      if (!harConfig.withContent) {
        reqObject.end();
      } else if (
        parseInt(res.headers['content-length'], 10) > harConfig.maxContentLength
      ) {
        reqObject.abort();

        const error = new RangeError('Maximum response size exceeded');
        (error as any).code = 'MAX_RES_BODY_SIZE';

        reqObject.emit('error', error);
      }
    });

    if (harConfig.withContent && Number.isFinite(harConfig.maxContentLength)) {
      let bufferLenght = 0;

      reqObject.on('data', (buffer) => {
        bufferLenght += buffer.length;

        if (bufferLenght > harConfig.maxContentLength) {
          reqObject.abort();

          const error = new RangeError('Maximum response size exceeded');
          (error as any).code = 'MAX_RES_BODY_SIZE';

          reqObject.emit('error', error);
        }
      });
    }

    if (typeof options.timeout === 'number') {
      const globalTimeout = setTimeout(() => {
        const err = new Error('global ETIMEDOUT');
        (err as any).code = 'ETIMEDOUT';
        reqObject.abort();
        reqObject.emit('error', err);
      }, options.timeout);

      reqObject.once('end', () => clearTimeout(globalTimeout));
    }

    if (net.isIP(reqObject.uri.hostname)) {
      this.dnsCache.remoteAddress = reqObject.uri.hostname;
    }

    return reqObject.then(
      (response: any) => [
        reqObject,
        null,
        response,
        this.dnsCache.remoteAddress
      ],
      (error: any) => [
        reqObject,
        error.cause,
        error.response,
        this.dnsCache.remoteAddress
      ]
    );
  }

  private shouldRedirect(
    response: Request.Response,
    requestConfig: Request.OptionsWithUrl,
    depth: number
  ): [boolean, Record<string, string> | null, string] {
    if (!response) {
      return [false, null, ''];
    }

    if (response.statusCode < 300 || response.statusCode >= 400) {
      return [false, null, ''];
    }

    const [parseError, redirectUrl]: [
      Record<string, string> | null,
      string
    ] = this.parser.parseRedirectUrl(response);

    if (parseError) {
      return [false, parseError, redirectUrl];
    }

    const { followRedirect = true, maxRedirects = 10 } = requestConfig;

    if (!followRedirect) {
      return [false, null, redirectUrl];
    }

    if (typeof followRedirect === 'function') {
      return [followRedirect(response), null, redirectUrl];
    }

    if (depth > maxRedirects) {
      return [
        false,
        {
          message: 'Max redirects exceeded',
          code: 'MAXREDIRECTS'
        },
        redirectUrl
      ];
    }

    return [true, null, redirectUrl];
  }

  private getCustomHostHeaderName(
    requestConfig: Request.OptionsWithUrl
  ): string | null {
    if (!requestConfig.headers) {
      return null;
    }
    const headerName = Object.keys(requestConfig.headers).find(
      (key) => key.toLowerCase() === 'host'
    );

    return headerName || null;
  }

  private hrtimeToMilliseconds([seconds, nanoseconds]: [
    number,
    number
  ]): number {
    return seconds * 1000 + nanoseconds / 1000000;
  }
}
