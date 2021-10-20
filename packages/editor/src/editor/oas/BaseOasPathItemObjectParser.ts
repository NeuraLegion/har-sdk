import {
  HttpMethod,
  isHttpMethod,
  SpecTreeNode,
  SpecTreeNodeParam
} from '../../models';
import { ParametersParser } from '../ParametersParser';
import { PathNodeParser } from '../PathNodeParser';
import jsonPointer from 'json-pointer';

export abstract class BaseOasPathItemObjectParser<D> implements PathNodeParser {
  protected constructor(protected readonly doc: D) {}

  protected abstract createParametersObjectParser(): ParametersParser;
  protected abstract createOperationObjectsParser(): PathNodeParser;

  public parse(pointer: string): SpecTreeNode {
    const path = jsonPointer.parse(pointer).pop();
    const pathItemObject = jsonPointer.get(this.doc, pointer);
    const parameters = this.parseParameters(pointer);

    const operationObjectsParser = this.createOperationObjectsParser();

    return {
      path,
      jsonPointer: pointer,
      children: Object.keys(pathItemObject)
        .filter((key: string) => isHttpMethod(key))
        .map((key) => key as HttpMethod)
        .map(
          (method: HttpMethod): SpecTreeNode =>
            operationObjectsParser.parse(
              jsonPointer.compile(['paths', path, method])
            )
        ),
      ...(parameters?.length ? { parameters } : {})
    };
  }

  protected parseParameters(pointer: string): SpecTreeNodeParam[] {
    return (
      this.createParametersObjectParser().parse(`${pointer}/parameters`) || []
    );
  }
}
