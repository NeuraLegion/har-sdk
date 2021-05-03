import { OpenAPIV2, OpenAPIV3, IJsonSchema } from 'openapi-types';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace OpenAPISampler {
  type Specification = OpenAPIV2.Document | OpenAPIV3.Document;

  interface Schema extends IJsonSchema {
    [index: string]: any;
    $ref?: string;
  }

  interface Options {
    skipReadOnly: boolean;
    skipWriteOnly: boolean;
    skipNonRequired: boolean;
    quiet: boolean;
  }
}
