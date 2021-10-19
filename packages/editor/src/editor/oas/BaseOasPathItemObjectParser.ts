import {
  HttpMethod,
  isHttpMethod,
  SpecTreeNode,
  SpecTreeNodeParam
} from '../../models';
import { PathNodeParser } from '../PathNodeParser';
import jsonPointer from 'json-pointer';

export abstract class BaseOasPathItemObjectParser<D, T>
  implements PathNodeParser
{
  protected constructor(
    protected readonly doc: D,
    private readonly operationObjectsParser: PathNodeParser
  ) {}

  protected abstract parseParameters(pointer: string): SpecTreeNodeParam[];

  public parse(pointer: string): SpecTreeNode {
    const path = jsonPointer.parse(pointer).pop();
    const pathItemObject: T = jsonPointer.get(this.doc, pointer);
    const parameters = this.parseParameters(pointer);

    return {
      path,
      jsonPointer: pointer,
      children: Object.keys(pathItemObject)
        .filter((key: string) => isHttpMethod(key))
        .map((key) => key as HttpMethod)
        .map(
          (method: HttpMethod): SpecTreeNode =>
            this.operationObjectsParser.parse(
              jsonPointer.compile(['paths', path, method])
            )
        ),
      ...(parameters?.length ? { parameters } : {})
    };
  }
}
