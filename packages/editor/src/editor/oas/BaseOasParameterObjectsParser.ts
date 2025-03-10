import { ParametersParser } from '../ParametersParser';
import {
  SpecTreeNodeParam,
  SpecTreeLocationParam,
  ParamLocation
} from '../../models';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';
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
    protected readonly doc: D,
    protected readonly dereferencedDoc: D
  ) {}

  protected abstract getParameterValue(
    param: OpenAPIV2.Parameter | OpenAPIV3.ParameterObject
  ): string;

  protected abstract getValueJsonPointer(paramPointer: string): string;

  public parse(pointer: string): SpecTreeNodeParam[] {
    const parameters: P[] = jsonPointer.has(this.doc, pointer)
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    return (
      parameters?.map(
        (parameter: P, idx: number): SpecTreeNodeParam =>
          this.parseParameter(`${pointer}/${idx}`, parameter)
      ) ?? []
    );
  }

  protected getParameterObject(
    pointer: string,
    parameter: P
  ): OpenAPIV2.Parameter | OpenAPIV3.ParameterObject {
    return (parameter as { $ref: string }).$ref
      ? jsonPointer.get(this.dereferencedDoc, pointer)
      : (parameter as OpenAPIV2.Parameter);
  }

  protected parseParameter(pointer: string, parameter: P): SpecTreeNodeParam {
    const paramObj: OpenAPIV2.Parameter | OpenAPIV3.ParameterObject =
      this.getParameterObject(pointer, parameter);

    const value = this.getParameterValue(paramObj);

    return {
      paramType: 'location',
      name: paramObj.name,
      ...(value != null ? { value } : {}),
      valueJsonPointer: this.getValueJsonPointer(pointer),
      location: paramObj.in as ParamLocation
    } as SpecTreeLocationParam;
  }
}
