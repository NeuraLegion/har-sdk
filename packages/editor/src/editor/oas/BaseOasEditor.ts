import { SpecTreeNode } from '../../models';
import { BaseEditor } from '../BaseEditor';
import { Editor } from '../Editor';
import jsonPointer from 'json-pointer';

export abstract class BaseOasEditor<T> extends BaseEditor<T> implements Editor {
  protected dereferencedDoc: T;

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

    jsonPointer.set(this.dereferencedDoc, valueJsonPointer, value);

    return super.setParameterValue(valueJsonPointer, value);
  }

  public removeNode(nodeJsonPointer: string): SpecTreeNode {
    jsonPointer.remove(this.dereferencedDoc, nodeJsonPointer);

    return super.removeNode(nodeJsonPointer);
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
