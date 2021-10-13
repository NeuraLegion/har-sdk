import { SpecTreeNodeParam, SpecTreeNodeVariableParam } from '../../models';
import { ParametersParser } from '../ParametersParser';
import jsonPointer from 'json-pointer';
import { Postman } from '@har-sdk/types';

export class VariablesParser implements ParametersParser {
  constructor(private readonly doc: Postman.Document) {}

  public parse(pointer: string): SpecTreeNodeParam[] {
    if (!jsonPointer.has(this.doc, pointer)) {
      return undefined;
    }

    const variables: Postman.Variable[] = jsonPointer.get(this.doc, pointer);

    return variables.map(
      (variable: Postman.Variable, idx: number): SpecTreeNodeVariableParam => ({
        paramType: 'variable',
        name: variable.key,
        value: variable.value,
        valueJsonPointer: `${pointer}/${idx}`
      })
    );
  }
}
