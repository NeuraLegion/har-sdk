import { ParametersParser } from '../interfaces';
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
      ): SpecTreeLocationParam => {
        const paramJsonPointer = `${pointer}/${idx}`;
        const $ref = (parameter as OpenAPIV3.ReferenceObject).$ref;

        const paramObj = $ref
          ? jsonPointer.get(this.dereferencedDoc, paramJsonPointer)
          : (parameter as OpenAPIV3.ParameterObject);
        const value =
          paramObj.example ||
          (paramObj.schema as OpenAPIV3.SchemaObject).default;

        return {
          paramType: 'location',
          name: paramObj.name,
          ...(value != null ? { value } : {}),
          valueJsonPointer: `${pointer}${jsonPointer.compile([
            idx.toString(10),
            'example'
          ])}`,
          location: paramObj.in as ParamLocation
        };
      }
    );
  }
}
