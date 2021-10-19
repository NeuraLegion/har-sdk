import { ParamLocation, SpecTreeLocationParam } from '../../../models';
import { BaseOasParameterObjectsParser } from '../BaseOasParameterObjectsParser';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV3ParameterObjectsParser extends BaseOasParameterObjectsParser<
  OpenAPIV3.Document,
  OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
> {
  constructor(
    doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {
    super(doc);
  }

  protected parseParameter(
    pointer: string,
    parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
  ): SpecTreeLocationParam {
    const paramObj = (parameter as OpenAPIV3.ReferenceObject).$ref
      ? jsonPointer.get(this.dereferencedDoc, pointer)
      : (parameter as OpenAPIV3.ParameterObject);
    const value =
      paramObj.example || (paramObj.schema as OpenAPIV3.SchemaObject).default;

    return {
      paramType: 'location',
      name: paramObj.name,
      ...(value != null ? { value } : {}),
      valueJsonPointer: `${pointer}/example`,
      location: paramObj.in as ParamLocation
    };
  }
}
