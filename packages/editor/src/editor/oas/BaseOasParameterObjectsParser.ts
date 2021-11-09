import { ParametersParser } from '../ParametersParser';
import {
  SpecTreeNodeParam,
  SpecTreeLocationParam,
  ParamLocation
} from '../../models';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export abstract class BaseOasParameterObjectsParser<
  D,
  P extends
    | OpenAPIV2.ReferenceObject
    | OpenAPIV2.Parameter
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.ParameterObject
> implements ParametersParser
{
  protected constructor(
    private readonly doc: D,
    private readonly dereferencedDoc: D
  ) {}

  protected abstract getParameterValue(
    param: OpenAPIV2.Parameter | OpenAPIV3.ParameterObject
  ): string;

  protected abstract getValueJsonPointer(paramPointer: string): string;

  public parse(pointer: string): SpecTreeNodeParam[] {
    const parameters: P[] = jsonPointer.has(this.doc, pointer)
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    return parameters?.map(
      (parameter: P, idx: number): SpecTreeLocationParam =>
        this.parseParameter(`${pointer}/${idx}`, parameter)
    ) ?? [];
  }

  protected parseParameter(
    pointer: string,
    parameter: P
  ): SpecTreeLocationParam {
    const paramObj: OpenAPIV2.Parameter | OpenAPIV3.ParameterObject = (
      parameter as { $ref: string }
    ).$ref
      ? jsonPointer.get(this.dereferencedDoc, pointer)
      : (parameter as OpenAPIV2.Parameter);

    const value = this.getParameterValue(paramObj);

    return {
      paramType: 'location',
      name: paramObj.name,
      ...(value != null ? { value } : {}),
      valueJsonPointer: this.getValueJsonPointer(pointer),
      location: paramObj.in as ParamLocation
    };
  }
}
