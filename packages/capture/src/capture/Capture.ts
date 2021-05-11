import { CaptureHar } from '../types/capture';
import * as Request from 'request';

export interface Capture {
  captureEntries(
    requestConfig: Request.OptionsWithUrl,
    harConfig?: CaptureHar.Options
  ): Promise<CaptureHar.HarEntry[]>;
}
