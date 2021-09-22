import { SpecTreeNode } from '../../models';
import { Editor } from '../interfaces';
import { OpenApiV3Parser } from './OpenApiV3Parser';
import jsonPath from 'jsonpath';
import jsonPointer from 'json-pointer';

export class OpenApiV3Editor extends OpenApiV3Parser implements Editor {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public setParameterValue(valueJsonPointer: string, value: any): SpecTreeNode {
    let refJsonPointer;
    if (!jsonPointer.has(this.doc, valueJsonPointer)) {
      refJsonPointer = this.getRefJsonPointer(valueJsonPointer);
    }

    if (refJsonPointer) {
      jsonPointer.set(
        this.doc,
        refJsonPointer,
        jsonPointer.get(this.dereferencedDoc, refJsonPointer)
      );
    }

    jsonPointer.set(this.doc, valueJsonPointer, value);
    jsonPointer.set(this.dereferencedDoc, valueJsonPointer, value);

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
    jsonPointer.remove(this.dereferencedDoc, nodeJsonPointer);

    const tree = JSON.parse(JSON.stringify(this.tree));
    jsonPath.apply(
      tree,
      '$..[?(@.jsonPointer=="' + nodeJsonPointer + '")]',
      () => undefined
    );
    this.tree = tree;

    return this.parse();
  }

  private getRefJsonPointer(valueJsonPointer: string): string | undefined {
    const parts: string[] = jsonPointer.parse(valueJsonPointer);
    while (parts.length) {
      parts.pop();
      if (jsonPointer.has(this.doc, jsonPointer.compile([...parts, '$ref']))) {
        return jsonPointer.compile(parts);
      }
    }

    return undefined;
  }
}
