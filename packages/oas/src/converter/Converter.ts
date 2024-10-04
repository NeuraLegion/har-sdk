import { OpenAPI, Request } from '@har-sdk/core';

export interface ConverterOptions {
  omitInferredAcceptHeadersInFavorOfParam?: boolean;
}

export interface Converter {
  convert(collection: OpenAPI.Document): Promise<Request[]>;
}
