import { SpecTreeNode } from '../../models';
import { Editor } from '../Editor';
import { PostmanParser } from './PostmanParser';
import jsonPath from 'jsonpath';
import jsonPointer from 'json-pointer';

export class PostmanEditor extends PostmanParser implements Editor {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public setParameterValue(valueJsonPointer: string, value: any): SpecTreeNode {
    jsonPointer.set(this.doc, valueJsonPointer, value);

    const tree = JSON.parse(JSON.stringify(this.tree));
    jsonPath.apply(
      tree,
      '$..[?(@.valueJsonPointer=="' + valueJsonPointer + '")]',
      (item) => ({ ...item, value })
    );
    this.tree = tree;

    return this.tree;
  }

  public removeNode(nodeJsonPointer: string): SpecTreeNode {
    jsonPointer.remove(this.doc, nodeJsonPointer);

    const tree = JSON.parse(JSON.stringify(this.tree));
    jsonPath.apply(
      tree,
      '$..[?(@.jsonPointer=="' + nodeJsonPointer + '")]',
      () => undefined
    );
    this.tree = tree;

    return this.parse();
  }
}
