import { CaptureHar } from '../types/capture';
import Request from 'request';

export interface BuilderEntryMeta {
  startTime: number;
  duration: number;
  remoteAddress: string;
}

export interface BuilderEntryParams {
  request?: Request.Request;
  response: Request.Response;
  error: any;
  harConfig?: CaptureHar.Options;
  redirectUrl: string;
  meta: BuilderEntryMeta;
}

export interface HarBuilder {
  buildHarEntry(params: BuilderEntryParams): CaptureHar.HarEntry;
  buildHarConfig(harConfig: CaptureHar.Options): CaptureHar.Options;
}
