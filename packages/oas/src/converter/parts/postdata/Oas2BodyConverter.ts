import { BodyConverter } from './BodyConverter';
import type { Sampler } from '../../Sampler';
import { filterLocationParams, getParameters, isOASV2 } from '../../../utils';
import type { OpenAPIV2, PostData } from '@har-sdk/core';

export class Oas2BodyConverter extends BodyConverter<OpenAPIV2.Document> {
  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  public convert(path: string, method: string): PostData | null {
    const tokens = ['paths', path, method];
    const params: OpenAPIV2.ParameterObject[] = getParameters(
      this.spec,
      path,
      method
    );
    const contentType = this.getContentType(path, method);

    let postData = this.convertBody(params, {
      tokens,
      contentType
    });

    if (!postData) {
      postData = this.convertFormData(params, {
        tokens,
        contentType
      });
    }

    return postData;
  }

  protected getContentType(path: string, method: string): string | undefined {
    const operation = this.spec.paths[path][method];

    let consumes: OpenAPIV2.MimeTypes;

    if (operation.consumes?.length) {
      consumes = operation.consumes;
    } else if (isOASV2(this.spec) && this.spec.consumes?.length) {
      consumes = this.spec.consumes;
    }

    return this.sampler.sample({
      type: 'array',
      examples: consumes
    });
  }

  private convertFormData(
    params: OpenAPIV2.ParameterObject[],
    {
      contentType,
      ...sampleOptions
    }: {
      tokens: string[];
      contentType?: string;
    }
  ): PostData {
    const formDataParams = filterLocationParams(params, 'formdata');
    if (!formDataParams.length) {
      return null;
    }

    const value = Object.fromEntries(
      formDataParams.map((param) => [
        param.name,
        this.sampleParam(param, { ...sampleOptions, params })
      ])
    );

    return this.encodePayload({ value, contentType });
  }

  private convertUnsupportedParamToString(
    param: OpenAPIV2.ParameterObject
  ): OpenAPIV2.ParameterObject {
    return {
      ...param,
      ...('in' in param && 'type' in param && param.type === 'file'
        ? { type: 'string' }
        : {})
    };
  }

  private convertBody(
    params: OpenAPIV2.ParameterObject[],
    {
      contentType,
      ...sampleOptions
    }: {
      tokens: string[];
      contentType?: string;
    }
  ): PostData {
    const bodyParams = filterLocationParams(params, 'body');

    for (const param of bodyParams) {
      if ('schema' in param) {
        const value = this.sampleParam(param, { ...sampleOptions, params });

        return this.encodePayload({ value, contentType, schema: param.schema });
      }
    }
  }

  private sampleParam(
    param: OpenAPIV2.ParameterObject,
    sampleOptions: { tokens: string[]; params: OpenAPIV2.ParameterObject[] }
  ): unknown {
    return this.sampler.sampleParam(
      this.convertUnsupportedParamToString(param),
      {
        ...sampleOptions,
        idx: sampleOptions.params.indexOf(param),
        spec: this.spec
      }
    );
  }
}