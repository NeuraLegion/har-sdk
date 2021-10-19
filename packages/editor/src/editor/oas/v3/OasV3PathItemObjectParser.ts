import { SpecTreeNodeParam, SpecTreeNodeVariableParam } from '../../../models';
import { BaseOasPathItemObjectParser } from '../BaseOasPathItemObjectParser';
import { OasV3OperationObjectParser } from './OasV3OperationObjectParser';
import { OasV3ParameterObjectsParser } from './OasV3ParameterObjectsParser';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV3PathItemObjectParser extends BaseOasPathItemObjectParser<
  OpenAPIV3.Document,
  OpenAPIV3.PathItemObject
> {
  private readonly parameterObjectsParser: OasV3ParameterObjectsParser;

  constructor(
    protected readonly doc: OpenAPIV3.Document,
    dereferencedDoc: OpenAPIV3.Document
  ) {
    super(doc, new OasV3OperationObjectParser(doc, dereferencedDoc));
    this.parameterObjectsParser = new OasV3ParameterObjectsParser(
      doc,
      dereferencedDoc
    );
  }

  protected parseParameters(pointer: string): SpecTreeNodeParam[] {
    const path = jsonPointer.parse(pointer).pop();
    const pathItemObject: OpenAPIV3.PathItemObject = jsonPointer.get(
      this.doc,
      pointer
    );

    const parameters: SpecTreeNodeParam[] =
      this.parameterObjectsParser.parse(`${pointer}/parameters`) || [];

    if (pathItemObject.servers?.length) {
      const servers: SpecTreeNodeVariableParam = {
        paramType: 'variable',
        name: 'servers',
        valueJsonPointer: jsonPointer.compile(['paths', path, 'servers']),
        value: pathItemObject.servers
      };

      parameters.push(servers);
    }

    return parameters;
  }
}
