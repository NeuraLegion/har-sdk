import { BaseOasParameterObjectsParser } from '../BaseOasParameterObjectsParser';
import { OpenAPIV2 } from '@har-sdk/types';

export class OasV2ParameterObjectsParser extends BaseOasParameterObjectsParser<
  OpenAPIV2.Document,
  OpenAPIV2.ReferenceObject | OpenAPIV2.Parameter
> {
  constructor(doc: OpenAPIV2.Document, dereferencedDoc: OpenAPIV2.Document) {
    super(doc, dereferencedDoc);
  }

  protected getParameterValue(
    paramObj: OpenAPIV2.Parameter
  ): string | undefined {
    return (
      paramObj.default ?? paramObj.items?.default ?? paramObj.schema?.default
    );
  }

  protected getValueJsonPointer(
    paramObj: OpenAPIV2.Parameter,
    paramPointer: string
  ): string {
    return paramObj.in === 'body'
      ? `${paramPointer}/schema/default`
      : `${paramPointer}/default`;
  }
}
