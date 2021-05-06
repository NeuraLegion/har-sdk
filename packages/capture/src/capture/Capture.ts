import { CaptureHar } from '../types/capture';
import * as Request from 'request';
import { Entry } from 'har-format';

export interface Capture {
  captureEntries(
    requestConfig: Request.OptionsWithUrl,
    harConfig?: CaptureHar.Options
  ): Promise<Entry[]>;
}
