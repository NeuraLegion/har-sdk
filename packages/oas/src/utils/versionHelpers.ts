import { Collection } from '../converter';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export const isV3 = (spec: Collection): spec is OpenAPIV3.Document =>
  (spec as OpenAPIV3.Document).openapi !== undefined;

export const isV2 = (spec: Collection): spec is OpenAPIV2.Document =>
  (spec as OpenAPIV2.Document).swagger !== undefined;
