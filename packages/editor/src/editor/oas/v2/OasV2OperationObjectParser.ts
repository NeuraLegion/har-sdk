import { HttpMethod, SpecTreeNode } from '../../../models';
import { PathNodeParser } from '../../PathNodeParser';
import { OasV2ParameterObjectsParser } from './OasV2ParameterObjectsParser';
import { OpenAPIV2 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV2OperationObjectParser implements PathNodeParser {
  constructor(
    private readonly doc: OpenAPIV2.Document,
    private readonly dereferencedDoc: OpenAPIV2.Document
  ) {}

  public parse(pointer: string): SpecTreeNode {
    const parameters = [
      ...(new OasV2ParameterObjectsParser(this.doc, this.dereferencedDoc).parse(
        `${pointer}/parameters`
      ) || [])
    ];

    const parts = jsonPointer.parse(pointer);
    const method = parts.pop();
    const path = parts.pop();

    return {
      path,
      method: method as HttpMethod,
      jsonPointer: pointer,
      ...(parameters?.length ? { parameters } : {})
    };
  }
}
