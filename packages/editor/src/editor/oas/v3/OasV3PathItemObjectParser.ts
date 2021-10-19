import {
  HttpMethod,
  isHttpMethod,
  SpecTreeNode,
  SpecTreeNodeParam,
  SpecTreeNodeVariableParam
} from '../../../models';
import { PathNodeParser } from '../../PathNodeParser';
import { OasV3OperationObjectParser } from './OasV3OperationObjectParser';
import { OasV3ParameterObjectsParser } from './OasV3ParameterObjectsParser';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV3PathItemObjectParser implements PathNodeParser {
  constructor(
    private readonly doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {}

  public parse(pointer: string): SpecTreeNode {
    const path = jsonPointer.parse(pointer).pop();
    const pathItemObject: OpenAPIV3.PathItemObject = jsonPointer.get(
      this.doc,
      pointer
    );
    const parameters = this.parseParameters(pointer);

    return {
      path,
      jsonPointer: pointer,
      children: Object.keys(pathItemObject)
        .filter((key: string) => isHttpMethod(key))
        .map((key) => key as HttpMethod)
        .map(
          (method: HttpMethod): SpecTreeNode =>
            new OasV3OperationObjectParser(
              this.doc,
              this.dereferencedDoc
            ).parse(jsonPointer.compile(['paths', path, method]))
        ),
      ...(parameters?.length ? { parameters } : {})
    };
  }

  private parseParameters(pointer: string): SpecTreeNodeParam[] {
    const path = jsonPointer.parse(pointer).pop();
    const pathItemObject: OpenAPIV3.PathItemObject = jsonPointer.get(
      this.doc,
      pointer
    );

    const parameters: SpecTreeNodeParam[] =
      new OasV3ParameterObjectsParser(this.doc, this.dereferencedDoc).parse(
        `${pointer}/parameters`
      ) || [];

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
