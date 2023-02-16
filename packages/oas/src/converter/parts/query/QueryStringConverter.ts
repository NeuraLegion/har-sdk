import { OperationObject, ParameterObject } from '../../../types';
import { getParameters, filterLocationParams } from '../../../utils';
import { LocationParam } from '../LocationParam';
import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import { SecurityRequirementsParser } from '../security';
import jsonPointer from 'json-pointer';
import { OpenAPI, QueryString } from '@har-sdk/core';

export abstract class QueryStringConverter<T extends OpenAPI.Document>
  implements SubConverter<QueryString[]>
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

  protected abstract convertQueryParam(
    queryParam: LocationParam<ParameterObject>
  ): QueryString[];

  public convert(path: string, method: string): QueryString[] {
    const tokens = ['paths', path, method];
    const pathObj: OperationObject = this.spec.paths[path][method];
    const params: ParameterObject[] = getParameters(this.spec, path, method);

    return filterLocationParams(params, 'query')
      .flatMap((param) => {
        const idx = params.indexOf(param);
        const value = this.sampler.sampleParam(param, {
          tokens,
          idx,
          spec: this.spec
        });

        return this.convertQueryParam({
          param,
          value,
          jsonPointer: jsonPointer.compile([
            ...tokens,
            'parameters',
            idx.toString(10)
          ])
        });
      })
      .concat(this.security.parse(pathObj, 'query'));
  }
}
