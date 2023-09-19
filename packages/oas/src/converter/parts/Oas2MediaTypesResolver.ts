import { isOASV2 } from '../../utils';
import { OpenAPIV2 } from '@har-sdk/core';

export class Oas2MediaTypesResolver {
  private readonly DEFAULT_CONSUME_MEDIA_TYPE: OpenAPIV2.MimeTypes = [
    'application/json'
  ];
  private readonly DEFAULT_PRODUCE_MEDIA_TYPE: OpenAPIV2.MimeTypes = ['*/*'];

  constructor(private readonly spec: OpenAPIV2.Document) {}

  public resolveToConsume(operation: OpenAPIV2.OperationObject) {
    return this.resolve(operation, 'consumes', this.DEFAULT_CONSUME_MEDIA_TYPE);
  }

  public resolveToProduce(operation: OpenAPIV2.OperationObject) {
    return this.resolve(operation, 'produces', this.DEFAULT_PRODUCE_MEDIA_TYPE);
  }

  private resolve(
    operation: OpenAPIV2.OperationObject,
    node: 'consumes' | 'produces',
    defaultMediaTypes: OpenAPIV2.MimeTypes
  ): OpenAPIV2.MimeTypes {
    let mediaTypes: OpenAPIV2.MimeTypes;

    if (operation[node]?.length) {
      mediaTypes = operation[node];
    } else if (isOASV2(this.spec) && this.spec[node]?.length) {
      mediaTypes = this.spec[node];
    }

    mediaTypes = mediaTypes
      ?.map((mediaType) => mediaType?.trim())
      .filter(Boolean);

    return mediaTypes?.length ? mediaTypes : defaultMediaTypes;
  }
}
