import { SpecTreeNode } from '../models';
import { Editor } from './Editor';
import { BaseTreeParser } from './BaseTreeParser';
import jsonPath from 'jsonpath';
import jsonPointer from 'json-pointer';

export abstract class BaseEditor<T>
  extends BaseTreeParser<T>
  implements Editor
{
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public setParameterValue(valueJsonPointer: string, value: any): SpecTreeNode {
    jsonPointer.set(this.doc, valueJsonPointer, value);

    jsonPath.apply(
      this.tree,
      '$..[?(@.valueJsonPointer=="' + valueJsonPointer + '")]',
      (item) => ({ ...item, value })
    );

    return this.tree;
  }

  public removeNode(nodeJsonPointer: string): SpecTreeNode {
    jsonPointer.remove(this.doc, nodeJsonPointer);

    jsonPath.apply(
      this.tree,
      '$..[?(@.jsonPointer=="' + nodeJsonPointer + '")]',
      () => undefined
    );

    return this.parse();
  }

  public getDocument(): Readonly<T> {
    return this.doc;
  }
}
