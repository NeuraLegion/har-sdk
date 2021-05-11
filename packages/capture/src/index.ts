import { DefaultHarBuilder } from './builder';
import { DefaultParser } from './parser';
import { CaptureHar } from './types/capture';
import pkg from '../package.json';
import { DefaultCapture } from './capture/DefaultCapture';
import Request from 'request';

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
): Promise<CaptureHar.Har> => {
  const parser = new DefaultParser();
  const builder = new DefaultHarBuilder(parser);
  const capture = new DefaultCapture(builder, parser);

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
