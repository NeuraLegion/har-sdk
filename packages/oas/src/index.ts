import {
  BaseUrlParser,
  DefaultConverter,
  Sampler,
  SecurityRequirementsFactory,
  SubConverterFactory,
  SubConverterRegistry
} from './converter';
import { isOASV2 } from './utils';
import type { OpenAPI, Request } from '@har-sdk/core';
import { Options } from '@har-sdk/openapi-sampler';

export * from './errors';
export { Options };

export const oas2har = (
  collection: OpenAPI.Document,
  options: Options = {}
): Promise<Request[]> => {
  if (!collection) {
    throw new TypeError('Please provide a valid OAS specification.');
  }

  const { includeVendorExamples } = options;

  options = {
    ...options,
    includeVendorExamples: isOASV2(collection) ? includeVendorExamples : false
  };

  const sampler = new Sampler(options);
  const baseUrlParser = new BaseUrlParser(sampler);
  const subConverterFactory = new SubConverterFactory(sampler);
  const subConverterRegistry = new SubConverterRegistry(subConverterFactory);
  const securityRequirementsFactory = new SecurityRequirementsFactory(sampler);

  return new DefaultConverter(
    baseUrlParser,
    subConverterRegistry,
    securityRequirementsFactory
  ).convert(collection);
};
