import { SpecTreeNodeParam } from '../../models';
import { ParametersParser } from '../ParametersParser';
import { PostmanBodyParser } from './PostmanBodyParser';
import { PostmanVariablesParser } from './PostmanVariablesParser';
import { Postman } from '@har-sdk/types';

export class PostmanParametersParser implements ParametersParser {
  constructor(private readonly doc: Postman.Document) {}

  public parse(pointer: string): SpecTreeNodeParam[] {
    const variablesParser = new PostmanVariablesParser(this.doc);

    return [
      variablesParser.parse(`${pointer}/variable`),
      variablesParser.parse(`${pointer}/request/url/variable`),
      variablesParser.parse(`${pointer}/request/url/query`),
      new PostmanBodyParser(this.doc).parse(`${pointer}/request/body`)
    ]
      .flat()
      .filter((x) => !!x);
  }
}
