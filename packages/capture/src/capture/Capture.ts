import { HarEntry, Options } from '../builder';
import * as Request from 'request';

export interface Capture {
  captureEntries(
    requestConfig: Request.OptionsWithUrl,
    harConfig?: Options
  ): Promise<HarEntry[]>;
}
