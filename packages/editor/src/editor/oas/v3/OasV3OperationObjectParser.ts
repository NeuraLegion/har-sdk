import { SpecTreeNode } from '../../../models';
import { BaseOasOperationObjectParser } from '../BaseOasOperationObjectParser';
import { OasV3ParameterObjectsParser } from './OasV3ParameterObjectsParser';
import { OasV3RequestBodyObjectParser } from './OasV3RequestBodyObjectParser';
import { OpenAPIV3 } from '@har-sdk/types';

export class OasV3OperationObjectParser extends BaseOasOperationObjectParser {
  constructor(
    private readonly doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {
    super();
  }

  public parse(pointer: string): SpecTreeNode {
    const node = super.parse(pointer);

    const parameters = [
      ...(node.parameters || []),
      ...(new OasV3RequestBodyObjectParser(
        this.doc,
        this.dereferencedDoc
      ).parse(`${pointer}/requestBody`) || [])
    ];

    return {
      ...node,
      ...(parameters?.length ? { parameters } : {})
    };
  }

  protected createParametersObjectParser(): OasV3ParameterObjectsParser {
    return new OasV3ParameterObjectsParser(this.doc, this.dereferencedDoc);
  }
}
