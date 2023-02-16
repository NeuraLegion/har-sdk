import { OperationObject, ParameterObject } from '../../../types';
import { filterLocationParams, getParameters } from '../../../utils';
import { LocationParam } from '../LocationParam';
import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import { SecurityRequirementsParser } from '../security';
import { Header, OpenAPI } from '@har-sdk/core';
import jsonPointer from 'json-pointer';

export abstract class HeadersConverter<T extends OpenAPI.Document>
  implements SubConverter<Header[]>
{
  private _security: SecurityRequirementsParser<T>;

  private get security(): SecurityRequirementsParser<T> {
    if (!this._security) {
      this._security = this.createSecurityRequirementsParser();
    }

    return this._security;
  }

  protected constructor(
    protected readonly spec: T,
    protected readonly sampler: Sampler
  ) {}

  protected abstract createSecurityRequirementsParser(): SecurityRequirementsParser<T>;

  protected abstract createContentTypeHeaders(
    pathObj: OperationObject
  ): Header[];

  protected abstract createAcceptHeaders(pathObj: OperationObject): Header[];

  protected abstract convertHeaderParam(
    headerParam: LocationParam<ParameterObject>
  ): Header;

  public convert(path: string, method: string): Header[] {
    const headers: Header[] = [];
    const pathObj = this.spec.paths[path][method];

    headers.push(...this.createContentTypeHeaders(pathObj));
    headers.push(...this.createAcceptHeaders(pathObj));

    headers.push(...this.parseFromParams(path, method));
    headers.push(...this.security.parseSecurityRequirements(pathObj, 'header'));

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
