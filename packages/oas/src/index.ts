import {
  BaseUrlParser,
  DefaultConverter,
  Sampler,
  SecurityRequirementsFactory,
  SubConverterFactory,
  SubConverterRegistry
} from './converter';
import type { OpenAPI, Request } from '@har-sdk/core';

export * from './errors';

export const oas2har = (collection: OpenAPI.Document): Promise<Request[]> => {
  if (!collection) {
    throw new TypeError('Please provide a valid OAS specification.');
  }

  const sampler = new Sampler();
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
