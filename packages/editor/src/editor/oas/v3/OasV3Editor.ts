import { SpecTreeNode } from '../../../models';
import { BaseOasEditor } from '../BaseOasEditor';
import { OasV3PathItemObjectParser } from './OasV3PathItemObjectParser';
import { DocFormat, OpenAPIV3 } from '@har-sdk/core';

export class OasV3Editor extends BaseOasEditor<OpenAPIV3.Document> {
  public async setup(source: string, format?: DocFormat): Promise<void> {
    const res = await this.load(source, format);
    if (!res) {
      throw new Error('Bad OpenAPI V3 specification');
    }
  }

  public parse(): SpecTreeNode {
    this.tree = this.createRootNode([
      {
        paramType: 'variable',
        name: 'servers',
        valueJsonPointer: '/servers',
        value: this.doc.servers ? this.doc.servers : []
      }
    ]);

    return this.tree;
  }

  protected createPathItemObjectParser(): OasV3PathItemObjectParser {
    return new OasV3PathItemObjectParser(this.doc, this.dereferencedDoc);
  }
}
