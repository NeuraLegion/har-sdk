import { HttpMethod, SpecTreeNode, SpecTreeNodeParam } from '../../../models';
import { isHttpMethod } from '../../../models/HttpMethod';
import { PathNodeParser } from '../../PathNodeParser';
import { OasV2OperationObjectParser } from './OasV2OperationObjectParser';
import { OasV2ParameterObjectsParser } from './OasV2ParameterObjectsParser';
import { OpenAPIV2 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV2PathItemObjectParser implements PathNodeParser {
  constructor(
    private readonly doc: OpenAPIV2.Document,
    private readonly dereferencedDoc: OpenAPIV2.Document
  ) {}

  public parse(pointer: string): SpecTreeNode {
    const path = jsonPointer.parse(pointer).pop();
    const pathItemObject: OpenAPIV2.PathItemObject = jsonPointer.get(
      this.doc,
      pointer
    );
    const parameters: SpecTreeNodeParam[] =
      new OasV2ParameterObjectsParser(this.doc, this.dereferencedDoc).parse(
        `${pointer}/parameters`
      ) || [];

    return {
      path,
      jsonPointer: pointer,
      children: Object.keys(pathItemObject)
        .filter((key: string) => isHttpMethod(key))
        .map((key) => key as HttpMethod)
        .map(
          (method: HttpMethod): SpecTreeNode =>
            new OasV2OperationObjectParser(
              this.doc,
              this.dereferencedDoc
            ).parse(jsonPointer.compile(['paths', path, method]))
        ),
      ...(parameters?.length ? { parameters } : {})
    };
  }
}
