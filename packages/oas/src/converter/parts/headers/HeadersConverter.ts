import { ConverterOptions } from '../../Converter';
import { OperationObject, ParameterObject } from '../../../types';
import {
  filterLocationParams,
  getOperation,
  getParameters
} from '../../../utils';
import { LocationParam } from '../LocationParam';
import { Sampler } from '../../Sampler';
import { SubConverter } from '../../SubConverter';
import { Header, OpenAPI } from '@har-sdk/core';
import jsonPointer from 'json-pointer';

export abstract class HeadersConverter<T extends OpenAPI.Document>
  implements SubConverter<Header[]>
{
  private readonly CONTENT_TYPE_METHODS = ['post', 'put', 'patch', 'delete'];
  private readonly CONTENT_TYPE_HEADER = 'content-type';

  protected constructor(
    private readonly spec: T,
    private readonly sampler: Sampler,
    private readonly options: ConverterOptions
  ) {}

  protected abstract createContentTypeHeaders(
    pathObj: OperationObject
  ): Header[];

  protected abstract createAcceptHeaders(pathObj: OperationObject): Header[];

  protected abstract convertHeaderParam(
    headerParam: LocationParam<ParameterObject>
  ): Header;

  public convert(path: string, method: string): Header[] {
    const headers: Header[] = [];
    const pathObj = getOperation(this.spec, path, method);

    if (
      this.CONTENT_TYPE_METHODS.includes(method.toLowerCase()) &&
      !headers.some(
        (header) => header.name.toLowerCase() === this.CONTENT_TYPE_HEADER
      )
    ) {
      headers.push(...this.createContentTypeHeaders(pathObj));
    }

    const acceptHeaders =  this.createAcceptHeaders(pathObj);

    const paramsHeaders =  this.parseFromParams(path, method);

    const addInferred =
      !this.options.omitInferredAcceptHeadersInFavorOfParam ||
      !paramsHeaders.some((x) => x.name === 'accept');

    headers.push(...(addInferred ? acceptHeaders : []), ...paramsHeaders );

    return headers;
  }

  protected createHeader(name: string, value: string): Header {
    return {
      value,
      name: name.toLowerCase()
    };
  }

  protected createHeaders(name: string, values: string[]): Header[] {
    return (Array.isArray(values) ? values : []).map((value) =>
      this.createHeader(name, value)
    );
  }

  private parseFromParams(path: string, method: string): Header[] {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const tokens = ['paths', path, method];

    return filterLocationParams(params, 'header').map((param) => {
      const idx = params.indexOf(param);
      const value = this.sampler.sampleParam(param, {
        tokens,
        idx,
        spec: this.spec
      });

      return this.convertHeaderParam({
        value,
        param: {
          ...param,
          name: param.name.toLowerCase()
        },
        jsonPointer: jsonPointer.compile([
          ...tokens,
          'parameters',
          idx.toString(10)
        ])
      });
    });
  }
}
