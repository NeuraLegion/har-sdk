import { ConverterOptions } from '../../Converter';
import { isObject } from '../../../utils';
import { LocationParam } from '../LocationParam';
import { Sampler } from '../../Sampler';
import { UriTemplator } from '../UriTemplator';
import { HeadersConverter } from './HeadersConverter';
import { Header, OpenAPIV3 } from '@har-sdk/core';

export class Oas3HeadersConverter extends HeadersConverter<OpenAPIV3.Document> {
  private readonly uriTemplator = new UriTemplator();

  constructor(
    spec: OpenAPIV3.Document,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(spec, sampler, options);
  }

  protected createContentTypeHeaders(
    pathObj: OpenAPIV3.OperationObject
  ): Header[] {
    const requestBody = pathObj.requestBody as OpenAPIV3.RequestBodyObject;
    if (requestBody?.content && isObject(requestBody?.content)) {
      return this.createHeaders(
        'content-type',
        Object.keys(requestBody.content)
      );
    }

    return [];
  }

  protected createAcceptHeaders(pathObj: OpenAPIV3.OperationObject): Header[] {
    const responses = pathObj.responses as OpenAPIV3.ResponsesObject;

    if (responses && isObject(responses)) {
      const code = Math.min(
        ...Object.keys(responses)
          .filter((key) => /^\d+$/.test(key))
          .map((key) => +key)
      );

      const response = responses[code.toString(10)] as OpenAPIV3.ResponseObject;

      return response?.content && isObject(response.content)
        ? this.createHeaders('accept', Object.keys(response.content))
        : [];
    }

    return [];
  }

  protected convertHeaderParam({
    param,
    value
  }: LocationParam<OpenAPIV3.ParameterObject>): Header {
    return this.createHeader(
      param.name,
      decodeURIComponent(
        this.uriTemplator.substitute(`{x${param.explode ? '*' : ''}}`, {
          x: value
        })
      )
    );
  }
}
