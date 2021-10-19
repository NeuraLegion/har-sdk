import { ParamLocation, SpecTreeLocationParam } from '../../../models';
import { BaseOasParameterObjectsParser } from '../BaseOasParameterObjectsParser';
import { OpenAPIV2 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV2ParameterObjectsParser extends BaseOasParameterObjectsParser<
  OpenAPIV2.Document,
  OpenAPIV2.ReferenceObject | OpenAPIV2.ParameterObject
> {
  constructor(
    doc: OpenAPIV2.Document,
    private readonly dereferencedDoc: OpenAPIV2.Document
  ) {
    super(doc);
  }

  protected parseParameter(
    pointer: string,
    parameter: OpenAPIV2.ReferenceObject | OpenAPIV2.ParameterObject
  ): SpecTreeLocationParam {
    const paramObj: OpenAPIV2.Parameter = (
      parameter as OpenAPIV2.ReferenceObject
    ).$ref
      ? jsonPointer.get(this.dereferencedDoc, pointer)
      : (parameter as OpenAPIV2.Parameter);
    const value = paramObj.default || paramObj?.items?.default;

    return {
      paramType: 'location',
      name: paramObj.name,
      ...(value != null ? { value } : {}),
      valueJsonPointer: `${pointer}/default`,
      location: paramObj.in as ParamLocation
    };
  }
}
