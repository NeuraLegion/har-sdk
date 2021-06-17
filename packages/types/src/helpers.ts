import { OpenAPIV2, OpenAPIV3, OpenAPI, Postman } from './collection';

type Document = OpenAPI.Document | Postman.Document;

export const isOASV2 = (doc: Document): doc is OpenAPIV2.Document =>
  (doc as OpenAPIV2.Document).swagger !== undefined;

export const isOASV3 = (doc: Document): doc is OpenAPIV3.Document =>
  (doc as OpenAPIV3.Document).openapi !== undefined;

export const isPostman = (doc: Document): doc is Postman.Document =>
  (doc as Postman.Document).info.version !== undefined;
