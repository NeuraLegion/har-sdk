import { HttpMethod, SpecTreeNode } from '../../models';
import { PathNodeParser } from '../interfaces';
import { ParameterObjectsParser } from './ParameterObjectsParser';
import { RequestBodyObjectParser } from './RequestBodyObjectParser';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OperationObjectParser implements PathNodeParser {
  constructor(
    private readonly doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {}

  public parse(pointer: string): SpecTreeNode {
    const parameters = [
      ...(new ParameterObjectsParser(this.doc, this.dereferencedDoc).parse(
        `${pointer}/parameters`
      ) || []),
      ...(new RequestBodyObjectParser(this.doc, this.dereferencedDoc).parse(
        `${pointer}/requestBody`
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
