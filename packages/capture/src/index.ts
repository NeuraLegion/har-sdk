import { DefaultHarBuilder, HarBuilder } from './builder';
import { DefaultParser } from './parser';
import { CaptureHar } from './types/capture';
import pkg from '../../../package.json';
import { Capture } from './capture/Capture';
import { DefaultCapture } from './capture/DefaultCapture';
import Request from 'request';
import { Har } from 'har-format';

const buildRequestConfig = (
  requestConfig: Request.OptionsWithUrl | string
): Request.OptionsWithUrl => {
  if (typeof requestConfig === 'string') {
    return { url: requestConfig };
  }

  return requestConfig;
};

export const captureHar = async (
  requestConfig: Request.OptionsWithUrl | string,
  harConfig?: CaptureHar.Options
): Promise<Har> => {
  const parser = new DefaultParser();
  const builder: HarBuilder = new DefaultHarBuilder(parser);
  const capture: Capture = new DefaultCapture(builder, parser);

  const entries = await capture.captureEntries(
    buildRequestConfig(requestConfig),
    builder.buildHarConfig(harConfig)
  );

  return {
    log: {
      entries,
      version: '1.2',
      creator: {
        name: pkg.name,
        version: pkg.version
      }
    }
  };
};

export { CaptureHar } from './types/capture';
