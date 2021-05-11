import { captureHar as captureHarRaw } from '../src';
import { har as validateHar } from 'har-validator';
import { CaptureHar } from '../src/types/capture';
import Request from 'request';

export const captureHar = (
  requestConfig: Request.OptionsWithUrl | string,
  harConfig?: CaptureHar.Options
) => {
  return captureHarRaw(requestConfig, harConfig).then((data) => {
    return validateHar(data).catch((err) => {
      var firstError = err.errors[0];
      throw new Error(
        `"${firstError.field}" (${firstError.type}) ${firstError.message}`
      );
    });
  });
};
