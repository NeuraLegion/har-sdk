import { OpenAPIV2, OpenAPIV3, Collection, Postman } from './collection';

export const isOASV2 = (doc: Collection.Document): doc is OpenAPIV2.Document =>
  (doc as OpenAPIV2.Document).swagger !== undefined;

export const isOASV3 = (doc: Collection.Document): doc is OpenAPIV3.Document =>
  (doc as OpenAPIV3.Document).openapi !== undefined;

export const isPostman = (doc: Collection.Document): doc is Postman.Document =>
  (doc as Postman.Document).info.version !== undefined;
