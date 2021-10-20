import { SpecTreeNode } from '../../../models';
import { BaseOasEditor } from '../BaseOasEditor';
import { OasV3PathItemObjectParser } from './OasV3PathItemObjectParser';
import { OpenAPIV3 } from '@har-sdk/types';

export class OasV3Editor extends BaseOasEditor<OpenAPIV3.Document> {
  public async setup(source: string): Promise<void> {
    await this.loadFromSource(source, 'Bad OpenAPI V3 specification');
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
