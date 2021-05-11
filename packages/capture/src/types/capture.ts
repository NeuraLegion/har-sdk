import Har from 'har-format';
import Request from 'request';
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

  interface FromDataValue {
    value: Part;
    options?: {
      filename: string;
      contentType: string;
    };
  }

  type Part = string | Buffer | Readable | FromDataValue;

  type FromDataType = Part | Part[];

  type FormData = Record<string, FromDataType>;

  interface Request extends Request.Request {
    formData?: FormData;
    req?: {
      _headers?: Request.Headers;
    };
  }

  interface HarPostDataText {
    text: string;
    params?: Har.Param[];
  }

  type HarPostData = Har.PostDataCommon &
    (Har.PostDataParams | HarPostDataText);

  interface HarRequest extends Omit<Har.Request, 'postData'> {
    postData?: HarPostData;
  }

  interface HarEntry extends Omit<Har.Entry, 'request'> {
    request?: HarRequest;
  }

  interface HarLog extends Omit<Har.Log, 'entries'> {
    entries: HarEntry[];
  }

  interface Har extends Omit<Har.Har, 'log'> {
    log: HarLog;
  }
}
