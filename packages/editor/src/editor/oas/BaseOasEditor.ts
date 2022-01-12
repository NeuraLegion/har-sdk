import { Editor } from '../Editor';
import { SpecTreeNode, SpecTreeNodeVariableParam } from '../../models';
import { BaseEditor } from '../BaseEditor';
import { PathNodeParser } from '../PathNodeParser';
import { DocFormat, OpenAPIV3, OpenAPIV2 } from '@har-sdk/core';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import jsonPointer from 'json-pointer';

export abstract class BaseOasEditor<
    D extends OpenAPIV3.Document | OpenAPIV2.Document
  >
  extends BaseEditor<D>
  implements Editor
{
  protected dereferencedDoc: D | undefined;

  protected abstract createPathItemObjectParser(): PathNodeParser;

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

  protected async load(
    source: string,
    errorMessage: string,
    format?: DocFormat
  ): Promise<void> {
    await super.load(source, errorMessage, format);

    this.dereferencedDoc = (await new $RefParser().dereference(
      JSON.parse(JSON.stringify(this.doc))
    )) as D;
  }

  protected createRootNode(
    parameters: SpecTreeNodeVariableParam[]
  ): SpecTreeNode {
    const pathItemObjectParser = this.createPathItemObjectParser();

    return {
      parameters,
      jsonPointer: '/',
      path: '/',
      name: this.doc.info.title,
      children: Object.keys(this.doc.paths).map((path: string) =>
        pathItemObjectParser.parse(jsonPointer.compile(['paths', path]))
      )
    };
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
