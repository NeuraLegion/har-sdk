import { HttpMethod, SpecTreeNode } from '../../../models';
import { PathNodeParser } from '../../PathNodeParser';
import { OasV3ParameterObjectsParser } from './OasV3ParameterObjectsParser';
import { OasV3RequestBodyObjectParser } from './OasV3RequestBodyObjectParser';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV3OperationObjectParser implements PathNodeParser {
  constructor(
    private readonly doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {}

  public parse(pointer: string): SpecTreeNode {
    const parameters = [
      ...(new OasV3ParameterObjectsParser(this.doc, this.dereferencedDoc).parse(
        `${pointer}/parameters`
      ) || []),
      ...(new OasV3RequestBodyObjectParser(
        this.doc,
        this.dereferencedDoc
      ).parse(`${pointer}/requestBody`) || [])
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
