import { SpecTreeNodeParam } from '../../models';
import { ParametersParser } from '../ParametersParser';
import { VariablesParser } from './VariablesParser';
import { Postman } from '@har-sdk/types';

export class PostmanParametersParser implements ParametersParser {
  constructor(private readonly doc: Postman.Document) {}

  public parse(pointer: string): SpecTreeNodeParam[] {
    const variablesParser = new VariablesParser(this.doc);

    return [
      variablesParser.parse(`${pointer}/variable`),
      variablesParser.parse(`${pointer}/request/url/variable`),
      variablesParser.parse(`${pointer}/request/url/query`)
    ]
      .flat()
      .filter((x) => !!x);
  }
}
