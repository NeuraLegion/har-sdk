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
    const sampleContent = content[contentType];

    if (sampleContent?.schema) {
      const data = this.sampleRequestBody(sampleContent, {
        tokens,
        contentType
      });

      return this.encodePayload(data, contentType, sampleContent.encoding);
    }

    return null;
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
      {
        ...sampleContent.schema,
        ...(sampleContent.example !== undefined
          ? { example: sampleContent.example }
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
}
