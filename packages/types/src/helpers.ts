import { OpenAPIV2, OpenAPIV3, OpenAPI } from './collection';

export const isOASV2 = (spec: OpenAPI.Document): spec is OpenAPIV2.Document =>
  (spec as OpenAPIV2.Document).swagger !== undefined;

export const isOASV3 = (spec: OpenAPI.Document): spec is OpenAPIV3.Document =>
  (spec as OpenAPIV3.Document).openapi !== undefined;
