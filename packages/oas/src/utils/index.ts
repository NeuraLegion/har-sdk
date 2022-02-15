import { OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export * from './Flattener';
export * from './isObject';

// TODO extract to core?
export const isOASV2 = (doc: OpenAPI.Document): doc is OpenAPIV2.Document =>
  'swagger' in doc;
export const isOASV3 = (doc: OpenAPI.Document): doc is OpenAPIV3.Document =>
  'openapi' in doc;
