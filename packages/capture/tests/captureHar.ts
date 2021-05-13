import { captureHar as captureHarRaw, CaptureHar } from '../src';
import { har as validateHar } from 'har-validator';
import Request from 'request';
import { Har } from 'har-format';

export const captureHar = (
  requestConfig: Request.OptionsWithUrl | string,
  harConfig?: CaptureHar.Options
): any =>
  captureHarRaw(requestConfig, harConfig).then((data) =>
    // eslint-disable-next-line @typescript-eslint/typedef
    validateHar(data as Har).catch(({ errors: [err] }: { errors: any[] }) => {
      throw new Error(`"${err.field}" (${err.type}) ${err.message}`);
    })
  );
