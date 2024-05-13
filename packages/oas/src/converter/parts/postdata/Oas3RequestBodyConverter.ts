import { BodyConverter } from './BodyConverter';
import type { Sampler } from '../../Sampler';
import { FormUrlEncodedMediaTypeEncoder } from './encoders/FormUrlEncodedMediaTypeEncoder';
import type { OpenAPIV3, PostData } from '@har-sdk/core';
import { OpenAPIV2 } from '@har-sdk/core';
import pointer from 'json-pointer';

export class Oas3RequestBodyConverter extends BodyConverter<OpenAPIV3.Document> {
  private readonly formUrlEncodedEncoder = new FormUrlEncodedMediaTypeEncoder();
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
      media: mediaTypeObject,
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

  protected encodeFormUrlencoded(
    value: unknown,
    fields?: Record<string, OpenAPIV3.EncodingObject>,
    schema?: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): string {
    return this.formUrlEncodedEncoder.encode({
      fields,
      value,
      schema
    });
  }

  private sampleAndEncodeRequestBody({
    media,
    tokens,
    contentType
  }: {
    media: OpenAPIV3.MediaTypeObject;
    tokens: string[];
    contentType: string;
  }): PostData {
    let value = this.sampleRequestBody(media, {
      tokens,
      contentType
    });

    if (this.shouldApplyEncoding(contentType) && media.encoding) {
      value = this.encodeProperties(value, media);
    }

    return this.encodePayload({
      value,
      contentType,
      schema: media.schema,
      fields: media.encoding
    });
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
          encoding.contentType
            ? this.encodeValue({
                value: data[property],
                contentType: encoding.contentType,
                schema: (mediaType.schema as OpenAPIV3.SchemaObject).properties[
                  property
                ]
              })
            : data[property]
        ]
      )
    );

    return Object.assign({}, data, encoded);
  }

  private sampleRequestBody(
    media: OpenAPIV3.MediaTypeObject,
    {
      contentType,
      tokens
    }: {
      tokens: string[];
      contentType: string;
    }
  ): unknown {
    const example = this.getExample(media);

    return this.sampler.sample(
      {
        ...media.schema,
        ...(example !== undefined
          ? {
              example
            }
          : {})
      },
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

  private getExample(schema: OpenAPIV3.MediaTypeObject): unknown | undefined {
    const examples = (schema.examples ?? {}) as Record<
      string,
      OpenAPIV3.ExampleObject
    >;
    const exampleKey = this.sampler.sample({
      type: 'array',
      examples: Object.keys(examples)
    });
    const example = examples[exampleKey]?.value;

    return example !== undefined ? example : schema.example;
  }
}
