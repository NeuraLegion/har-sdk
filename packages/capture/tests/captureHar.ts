import { captureHar as captureHarRaw, CaptureHar } from '../src';
import { har as validateHar } from 'har-validator';
import Request from 'request';

export const captureHar = (
  requestConfig: Request.OptionsWithUrl | string,
  harConfig?: CaptureHar.Options
) =>
  captureHarRaw(requestConfig, harConfig).then((data) =>
    // eslint-disable-next-line @typescript-eslint/typedef
    validateHar(data).catch(({ errors: [err] }: { errors: any[] }) => {
      throw new Error(`"${err.field}" (${err.type}) ${err.message}`);
    })
  );
