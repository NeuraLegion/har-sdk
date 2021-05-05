import * as Har from 'har-format';
import * as Request from 'request';
import { Readable } from 'stream';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace CaptureHar {
  interface CaptureError {
    message: string;
    code: number;
  }

  interface HarResponse extends Har.Response {
    _error?: CaptureError;
    _remoteAddress?: string;
  }

  interface Options {
    withContent?: boolean;
    maxContentLength?: number;
  }

  type Part = string | Buffer | Readable;
  type FormData = Record<
    string,
    | Part
    | Part[]
    | {
        value: Part;
        options?: {
          filename: string;
          contentType: string;
        };
      }
  >;

  export interface Request extends Request.Request {
    formData?: FormData;
    req?: {
      _headers?: Request.Headers;
    };
  }
}
