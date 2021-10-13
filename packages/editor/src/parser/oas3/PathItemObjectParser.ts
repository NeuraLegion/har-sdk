import {
  HttpMethod,
  isHttpMethod,
  SpecTreeNode,
  SpecTreeNodeParam,
  SpecTreeNodeVariableParam
} from '../../models';
import { PathNodeParser } from '../PathNodeParser';
import { OperationObjectParser } from './OperationObjectParser';
import { ParameterObjectsParser } from './ParameterObjectsParser';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class PathItemObjectParser implements PathNodeParser {
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
    const parameters: SpecTreeNodeParam[] =
      new ParameterObjectsParser(this.doc, this.dereferencedDoc).parse(
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

    return {
      path,
      jsonPointer: pointer,
      children: Object.keys(pathItemObject)
        .filter((key: string) => isHttpMethod(key))
        .map((key) => key as HttpMethod)
        .map(
          (method: HttpMethod): SpecTreeNode =>
            new OperationObjectParser(this.doc, this.dereferencedDoc).parse(
              jsonPointer.compile(['paths', path, method])
            )
        ),
      ...(parameters?.length ? { parameters } : {})
    };
  }
}
