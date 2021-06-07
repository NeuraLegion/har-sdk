import { OAS } from '@har-sdk/validator';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export const isV3 = (spec: OAS.Document): spec is OpenAPIV3.Document =>
  (spec as OpenAPIV3.Document).openapi !== undefined;

export const isV2 = (spec: OAS.Document): spec is OpenAPIV2.Document =>
  (spec as OpenAPIV2.Document).swagger !== undefined;
