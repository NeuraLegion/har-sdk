import Request from 'request';
import HarFormat from 'har-format';
import { Readable } from 'stream';

export interface BuilderEntryMeta {
  startTime: number;
  duration: number;
  remoteAddress: string;
}

export interface Options {
  withContent?: boolean;
  maxContentLength?: number;
}

export interface BuilderEntryParams {
  request?: Request.Request;
  response: Request.Response;
  error: any;
  harConfig?: Options;
  redirectUrl: string;
  meta: BuilderEntryMeta;
}

export interface HarPostDataText {
  text: string;
  params?: HarFormat.Param[];
}

export type HarPostData = HarFormat.PostDataCommon &
  (HarFormat.PostDataParams | HarPostDataText);

export interface HarRequest extends Omit<HarFormat.Request, 'postData'> {
  postData?: HarPostData;
}

export interface HarEntry extends Omit<HarFormat.Entry, 'request'> {
  request?: HarRequest;
}

export interface HarLog extends Omit<HarFormat.Log, 'entries'> {
  entries: HarEntry[];
}

export interface Har extends Omit<HarFormat.Har, 'log'> {
  log: HarLog;
}
export interface CaptureError {
  message: string;
  code: number;
}

export interface HarResponse extends HarFormat.Response {
  _error?: CaptureError;
  _remoteAddress?: string;
}
export interface FromDataValue {
  value: Part;
  options?: {
    filename: string;
    contentType: string;
  };
}

export type Part = string | Buffer | Readable | FromDataValue;

export type FromDataType = Part | Part[];

type FormData = Record<string, FromDataType>;

export interface Request extends Request.Request {
  formData?: FormData;
  req?: {
    _headers?: Request.Headers;
  };
}

export interface HarBuilder {
  buildHarEntry(params: BuilderEntryParams): HarEntry;
  buildHarConfig(harConfig: Options): Options;
}
