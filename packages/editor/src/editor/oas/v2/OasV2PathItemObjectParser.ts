import { BaseOasPathItemObjectParser } from '../BaseOasPathItemObjectParser';
import { OasV2OperationObjectParser } from './OasV2OperationObjectParser';
import { OasV2ParameterObjectsParser } from './OasV2ParameterObjectsParser';
import { OpenAPIV2 } from '@har-sdk/types';

export class OasV2PathItemObjectParser extends BaseOasPathItemObjectParser<OpenAPIV2.Document> {
  constructor(
    protected readonly doc: OpenAPIV2.Document,
    private readonly dereferencedDoc: OpenAPIV2.Document
  ) {
    super(doc);
  }

  protected createParametersObjectParser(): OasV2ParameterObjectsParser {
    return new OasV2ParameterObjectsParser(this.doc, this.dereferencedDoc);
  }

  protected createOperationObjectsParser(): OasV2OperationObjectParser {
    return new OasV2OperationObjectParser(this.doc, this.dereferencedDoc);
  }
}
