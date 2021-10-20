import { SpecTreeNodeParam } from '../../../models';
import { BaseOasPathItemObjectParser } from '../BaseOasPathItemObjectParser';
import { OasV2OperationObjectParser } from './OasV2OperationObjectParser';
import { OasV2ParameterObjectsParser } from './OasV2ParameterObjectsParser';
import { OpenAPIV2 } from '@har-sdk/types';

export class OasV2PathItemObjectParser extends BaseOasPathItemObjectParser<OpenAPIV2.Document> {
  private readonly parameterObjectsParser: OasV2ParameterObjectsParser;

  constructor(
    protected readonly doc: OpenAPIV2.Document,
    dereferencedDoc: OpenAPIV2.Document
  ) {
    super(doc, new OasV2OperationObjectParser(doc, dereferencedDoc));
    this.parameterObjectsParser = new OasV2ParameterObjectsParser(
      doc,
      dereferencedDoc
    );
  }

  protected parseParameters(pointer: string): SpecTreeNodeParam[] {
    return this.parameterObjectsParser.parse(`${pointer}/parameters`) || [];
  }
}
