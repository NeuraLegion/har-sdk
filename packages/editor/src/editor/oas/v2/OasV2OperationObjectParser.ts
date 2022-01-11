import { BaseOasOperationObjectParser } from '../BaseOasOperationObjectParser';
import { OasV2ParameterObjectsParser } from './OasV2ParameterObjectsParser';
import { OpenAPIV2 } from '@har-sdk/core';

export class OasV2OperationObjectParser extends BaseOasOperationObjectParser {
  constructor(
    private readonly doc: OpenAPIV2.Document,
    private readonly dereferencedDoc: OpenAPIV2.Document
  ) {
    super();
  }

  protected createParametersObjectParser(): OasV2ParameterObjectsParser {
    return new OasV2ParameterObjectsParser(this.doc, this.dereferencedDoc);
  }
}
