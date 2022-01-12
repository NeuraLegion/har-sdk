import { SpecTreeNodeParam, SpecTreeNodeVariableParam } from '../../../models';
import { BaseOasPathItemObjectParser } from '../BaseOasPathItemObjectParser';
import { OasV3OperationObjectParser } from './OasV3OperationObjectParser';
import { OasV3ParameterObjectsParser } from './OasV3ParameterObjectsParser';
import { OpenAPIV3 } from '@har-sdk/core';
import jsonPointer from 'json-pointer';

export class OasV3PathItemObjectParser extends BaseOasPathItemObjectParser<OpenAPIV3.Document> {
  constructor(
    protected readonly doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {
    super(doc);
  }

  protected parseParameters(pointer: string): SpecTreeNodeParam[] {
    const parameters: SpecTreeNodeParam[] = [];

    const path = jsonPointer.parse(pointer).pop();
    const pathItemObject: OpenAPIV3.PathItemObject = jsonPointer.get(
      this.doc,
      pointer
    );

    if (pathItemObject.servers?.length) {
      const servers: SpecTreeNodeVariableParam = {
        paramType: 'variable',
        name: 'servers',
        valueJsonPointer: jsonPointer.compile(['paths', path, 'servers']),
        value: pathItemObject.servers
      };

      parameters.push(servers);
    }

    return [...super.parseParameters(pointer), ...parameters];
  }

  protected createParametersObjectParser(): OasV3ParameterObjectsParser {
    return new OasV3ParameterObjectsParser(this.doc, this.dereferencedDoc);
  }

  protected createOperationObjectsParser(): OasV3OperationObjectParser {
    return new OasV3OperationObjectParser(this.doc, this.dereferencedDoc);
  }
}
