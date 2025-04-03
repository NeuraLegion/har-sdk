import { BodyConverter } from './BodyConverter';
import type { Sampler } from '../../Sampler';
import { DefaultEncodingHandler } from './DefaultEncodingHandler';
import { Oas31EncodingHandler } from './Oas31EncodingHandler';
import { SchemaObject } from './EncodingHandler';
import { OpenAPIV3, PostData } from '@har-sdk/core';
import pointer from 'json-pointer';

export class Oas3RequestBodyConverter extends BodyConverter<OpenAPIV3.Document> {
  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(
      spec,
      sampler,
      spec.openapi.startsWith('3.0')
        ? new DefaultEncodingHandler()
        : new Oas31EncodingHandler()
    );
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

    if (
      this.encodingHandler.isArbitraryBinary(
        contentType,
        mediaTypeObject?.schema as OpenAPIV3.SchemaObject
      )
    ) {
      return this.sampleAndEncodeRequestBody({
        media: {
          schema: {
            type: 'string',
            format: 'binary'
          }
        },
        tokens,
        contentType
      });
    }

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

    if (this.encodingHandler.shouldEncodeProperties(contentType, media)) {
      value = this.encodeProperties(value, media);
    }

    return this.encodePayload({
      value,
      contentType,
      schema: media.schema,
      fields: media.encoding
    });
  }

  private encodeProperties(
    data: unknown,
    media: OpenAPIV3.MediaTypeObject
  ): unknown {
    const { schema, value: obj } = this.findObject({
      schema: media.schema,
      value: data
    });

    const encoded = Object.fromEntries(
      Object.entries(media.encoding ?? {})
        .map(
          ([property, encoding]: [string, OpenAPIV3.EncodingObject]) =>
            [
              property,
              encoding,
              (schema as OpenAPIV3.SchemaObject).properties[property]
            ] as [
              string,
              OpenAPIV3.EncodingObject,
              OpenAPIV3.SchemaObject | undefined
            ]
        )
        .map(
          ([property, encoding, propertySchema]: [
            string,
            OpenAPIV3.EncodingObject,
            OpenAPIV3.SchemaObject | undefined
          ]) => [
            property,
            this.encodePropertyValue({
              value: obj[property],
              contentType:
                encoding.contentType ??
                this.encodingHandler.resolvePropertyContentType(
                  obj[property],
                  propertySchema
                ),
              schema: propertySchema
            })
          ]
        )
    );

    return Object.assign({}, obj, encoded);
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

  private findObject({
    schema,
    value
  }: {
    schema?: SchemaObject;
    value: unknown;
  }): { schema?: SchemaObject; value?: unknown } {
    if (!schema?.type || value === undefined) {
      return { schema: undefined, value: undefined };
    }

    const inferredType = this.inferSchemaType(schema);
    if (inferredType === 'array' && Array.isArray(value)) {
      return this.findObject({
        schema: (schema as OpenAPIV3.ArraySchemaObject).items,
        value: value.at(0)
      });
    }

    return { schema, value };
  }

  private inferSchemaType(schema?: SchemaObject): string {
    return !Array.isArray(schema.type)
      ? schema.type
      : schema.type.find((x) => x !== 'null') ??
          schema.type.find((x) => x === 'null');
  }
}
