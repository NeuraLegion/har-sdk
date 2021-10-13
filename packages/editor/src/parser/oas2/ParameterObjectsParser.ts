import { ParametersParser } from '../ParametersParser';
import {
  SpecTreeNodeParam,
  ParamLocation,
  SpecTreeLocationParam,
  SpecTreeRequestBodyParam
} from '../../models';
import { OpenAPIV2 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class ParameterObjectsParser implements ParametersParser {
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
      ): SpecTreeLocationParam | SpecTreeRequestBodyParam => {
        const paramJsonPointer = `${pointer}/${idx}`;
        const $ref = (parameter as OpenAPIV2.ReferenceObject).$ref;

        const paramObj: OpenAPIV2.Parameter = $ref
          ? jsonPointer.get(this.dereferencedDoc, paramJsonPointer)
          : (parameter as OpenAPIV2.Parameter);
        const value = paramObj.default || paramObj?.items?.default;

        return {
          paramType: 'location',
          name: paramObj.name,
          ...(value != null ? { value } : {}),
          valueJsonPointer: `${pointer}${jsonPointer.compile([
            idx.toString(10),
            'default'
          ])}`,
          location: paramObj.in as ParamLocation
        };
      }
    );
  }
}
