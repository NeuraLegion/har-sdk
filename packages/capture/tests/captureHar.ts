import { captureHar as captureHarRaw } from '../src';
import { Options } from '../src/builder';
import { har as validateHar } from 'har-validator';
import Request from 'request';
import Har from 'har-format';

export const captureHar = (
  requestConfig: Request.OptionsWithUrl | string,
  harConfig?: Options
): any =>
  captureHarRaw(requestConfig, harConfig).then((data) =>
    // eslint-disable-next-line @typescript-eslint/typedef
    validateHar(data as Har.Har).catch(
      // eslint-disable-next-line @typescript-eslint/typedef
      ({ errors: [err] }: { errors: any[] }) => {
        throw new Error(`"${err.field}" (${err.type}) ${err.message}`);
      }
    )
  );
