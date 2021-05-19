import { DefaultHarBuilder, Har, Options } from './builder';
import { DefaultParser } from './parser';
import { DefaultCapture } from './capture';
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
  harConfig?: Options
): Promise<Har> => {
  const parser = new DefaultParser();
  const builder = new DefaultHarBuilder(parser);
  const capture = new DefaultCapture(builder, parser);

  const entries = await capture.captureEntries(
    buildRequestConfig(requestConfig),
    builder.buildHarConfig(harConfig)
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('../package.json');

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
