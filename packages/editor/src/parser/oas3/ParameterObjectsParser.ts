import { ParametersParser } from '../ParametersParser';
import {
  SpecTreeNodeParam,
  ParamLocation,
  SpecTreeLocationParam
} from '../../models';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class ParameterObjectsParser implements ParametersParser {
  constructor(
    private readonly doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {}

  public parse(pointer: string): SpecTreeNodeParam[] {
    const parameters: (
      | OpenAPIV3.ReferenceObject
      | OpenAPIV3.ParameterObject
    )[] = jsonPointer.has(this.doc, pointer)
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    return parameters?.map(
      (
        parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject,
        idx: number
      ): SpecTreeLocationParam =>
        this.parseParameter(`${pointer}/${idx}`, parameter)
    );
  }

  private parseParameter(
    pointer: string,
    parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
  ): SpecTreeLocationParam {
    const $ref = (parameter as OpenAPIV3.ReferenceObject).$ref;

    const paramObj = $ref
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
