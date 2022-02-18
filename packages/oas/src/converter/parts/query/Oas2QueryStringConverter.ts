import { isObject } from '../../../utils';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { Sampler } from '../Sampler';
import { QueryStringConverter } from './QueryStringConverter';
import { OpenAPIV2, QueryString } from '@har-sdk/core';

export class Oas2QueryStringConverter extends QueryStringConverter<OpenAPIV2.Parameter> {
  private readonly oas2ValueSerializer = new Oas2ValueSerializer();

  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected convertQueryParam(
    param: OpenAPIV2.Parameter,
    paramValue: unknown,
    paramJsonPointer: string
  ): QueryString[] {
    const { name } = param;
    const value = this.oas2ValueSerializer.serialize(
      param as OpenAPIV2.Parameter,
      paramValue,
      paramJsonPointer
    );

    let values: QueryString[];

    if (isObject(value)) {
      const flatten = this.oas2ValueSerializer.toFlattenObject(value, {
        format: 'indices'
      });
      values = Object.entries(flatten).map(([n, x]: any[]) => ({
        name: n,
        value: `${x}`
      }));
    } else if (Array.isArray(value)) {
      values = value.map((x) => ({ name, value: `${x}` }));
    } else {
      values = [
        {
          name,
          value: `${value}`
        }
      ];
    }

    return values;
  }
}
