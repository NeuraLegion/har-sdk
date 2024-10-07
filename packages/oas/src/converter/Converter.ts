import { OpenAPI, Request } from '@har-sdk/core';

export interface ConverterOptions {
  skipAcceptHeaderInference?: boolean;
}

export interface Converter {
  convert(collection: OpenAPI.Document): Promise<Request[]>;
}
