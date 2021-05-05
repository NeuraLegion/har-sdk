import { CaptureHar } from '../types/capture';
import * as Har from 'har-format';
import * as Request from 'request';

export interface BuilderEntryMeta {
  startTime: number;
  duration: number;
  remoteAddress: string;
}

export interface BuilderEntryParams {
  request?: Request.Request;
  response: Request.Response;
  error: any;
  harConfig: CaptureHar.Options;
  redirectUrl: string;
  meta: BuilderEntryMeta;
}

export interface HarBuilder {
  buildHarEntry(params: BuilderEntryParams): Har.Entry;
  buildHarConfig(harConfig: CaptureHar.Options): CaptureHar.Options;
}
