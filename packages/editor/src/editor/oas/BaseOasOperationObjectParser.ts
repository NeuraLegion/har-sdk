import { ParametersParser } from '../ParametersParser';
import { SpecTreeNode, HttpMethod } from '../../models';
import { PathNodeParser } from '../PathNodeParser';
import jsonPointer from 'json-pointer';

export abstract class BaseOasOperationObjectParser implements PathNodeParser {
  protected abstract createParametersObjectParser(): ParametersParser;

  public parse(pointer: string): SpecTreeNode {
    const parameters = [
      ...(this.createParametersObjectParser().parse(`${pointer}/parameters`) ||
        [])
    ];

    const parts = jsonPointer.parse(pointer);
    const method = parts.pop();
    const path = parts.pop();

    return {
      path,
      method: method as HttpMethod,
      jsonPointer: pointer,
      ...(parameters?.length ? { parameters } : {})
    };
  }
}
