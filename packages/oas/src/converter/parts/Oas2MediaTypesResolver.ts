import { isOASV2 } from '../../utils';

import { OpenAPIV2 } from '@har-sdk/core';

export class Oas2MediaTypesResolver {
  private readonly DEFAULT_MEDIA_TYPE = 'application/json';

  constructor(private readonly spec: OpenAPIV2.Document) {}

  public resolveToConsume(operation: OpenAPIV2.OperationObject) {
    let mediaTypes = this.resolve(operation, 'consumes');
    if (!mediaTypes?.length) {
      mediaTypes = [this.DEFAULT_MEDIA_TYPE];
    }

    return mediaTypes;
  }

  public resolveToProduce(operation: OpenAPIV2.OperationObject) {
    const mediaTypes = this.resolve(operation, 'produces');

    return mediaTypes?.length ? mediaTypes : undefined;
  }

  private resolve(
    operation: OpenAPIV2.OperationObject,
    node: 'consumes' | 'produces'
  ): OpenAPIV2.MimeTypes {
    let mediaTypes: OpenAPIV2.MimeTypes;

    if (operation[node]?.length) {
      mediaTypes = operation[node];
    } else if (isOASV2(this.spec) && this.spec[node]?.length) {
      mediaTypes = this.spec[node];
    }

    return mediaTypes?.map((mediaType) => mediaType?.trim()).filter(Boolean);
  }
}
