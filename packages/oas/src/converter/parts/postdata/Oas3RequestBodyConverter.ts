import { BodyConverter } from './BodyConverter';
import { Sampler } from '../../Sampler';
import { OpenAPIV3, PostData } from '@har-sdk/core';
import pointer from 'json-pointer';

export class Oas3RequestBodyConverter extends BodyConverter<OpenAPIV3.Document> {
  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  public convert(path: string, method: string): PostData | null {
    const pathObj = this.spec.paths[path][method];
    const tokens = ['paths', path, method];

    const contentType = this.getContentType(path, method);

    if (!contentType) {
      return null;
    }

    const content = pathObj.requestBody?.content ?? {};
    const mediaTypeObject = content[contentType] as OpenAPIV3.MediaTypeObject;

    if (!mediaTypeObject?.schema) {
      return null;
    }

    return this.sampleAndEncodeRequestBody({
      mediaTypeObject,
      tokens,
      contentType
    });
  }

  protected getContentType(path: string, method: string): string | undefined {
    const pathObj = this.spec.paths[path][method];
    const content = pathObj.requestBody?.content ?? {};
    const keys = Object.keys(content);

    return this.sampler.sample({
      type: 'array',
      examples: keys
    });
  }

  private sampleAndEncodeRequestBody({
    mediaTypeObject,
    tokens,
    contentType
  }: {
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    tokens: string[];
    contentType: string;
  }): PostData {
    let data = this.sampleRequestBody(mediaTypeObject, {
      tokens,
      contentType
    });

    if (this.shouldApplyEncoding(contentType) && mediaTypeObject.encoding) {
      data = this.encodeProperties(data, mediaTypeObject);
    }

    return this.encodePayload(data, contentType, mediaTypeObject.schema);
  }

  private shouldApplyEncoding(contentType: string): boolean {
    return (
      contentType.startsWith('multipart/') ||
      contentType === 'application/x-www-form-urlencoded'
    );
  }

  private encodeProperties(
    data: unknown,
    mediaType: OpenAPIV3.MediaTypeObject
  ): unknown {
    const encoded = Object.fromEntries(
      Object.entries(mediaType.encoding ?? {}).map(
        ([property, encoding]: [string, OpenAPIV3.EncodingObject]) => [
          property,
          this.encodeValue(
            data[property],
            encoding.contentType,
            (mediaType.schema as OpenAPIV3.SchemaObject).properties[property]
          )
        ]
      )
    );

    return Object.assign({}, data, encoded);
  }

  private sampleRequestBody(
    sampleContent: OpenAPIV3.MediaTypeObject,
    {
      contentType,
      tokens
    }: {
      tokens: string[];
      contentType: string;
    }
  ): unknown {
    return this.sampler.sample(
      this.getSchemaForSampling(sampleContent, contentType),
      {
        spec: this.spec,
        jsonPointer: pointer.compile([
          ...tokens,
          'requestBody',
          'content',
          contentType,
          'schema'
        ])
      }
    );
  }

  private getSchemaForSampling(
    sampleContent: OpenAPIV3.MediaTypeObject,
    contentType: string
  ): OpenAPIV3.SchemaObject {
    // FIXME: it is not correct to use the content type like a key for examples
    const reusableExample = sampleContent.examples?.[contentType] as
      | OpenAPIV3.ExampleObject
      | OpenAPIV3.SchemaObject
      | undefined;

    return {
      ...sampleContent.schema,
      ...(sampleContent.example !== undefined
        ? { example: sampleContent.example }
        : {}),
      // TODO: add support for the externalValue
      ...(reusableExample !== undefined
        ? {
            example:
              'value' in reusableExample
                ? reusableExample.value
                : reusableExample
          }
        : {})
    };
  }
}
