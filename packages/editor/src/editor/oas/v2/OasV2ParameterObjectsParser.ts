import { ParametersParser } from '../../ParametersParser';
import {
  SpecTreeNodeParam,
  ParamLocation,
  SpecTreeLocationParam
} from '../../../models';
import { OpenAPIV2 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV2ParameterObjectsParser implements ParametersParser {
  constructor(
    private readonly doc: OpenAPIV2.Document,
    private readonly dereferencedDoc: OpenAPIV2.Document
  ) {}

  public parse(pointer: string): SpecTreeNodeParam[] {
    const parameters: (
      | OpenAPIV2.ReferenceObject
      | OpenAPIV2.ParameterObject
    )[] = jsonPointer.has(this.doc, pointer)
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    return parameters?.map(
      (
        parameter: OpenAPIV2.ReferenceObject | OpenAPIV2.ParameterObject,
        idx: number
      ): SpecTreeLocationParam =>
        this.parseParameter(`${pointer}/${idx}`, parameter)
    );
  }

  private parseParameter(
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
