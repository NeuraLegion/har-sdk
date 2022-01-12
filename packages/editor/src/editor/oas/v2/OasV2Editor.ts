import { OasV2PathItemObjectParser } from './OasV2PathItemObjectParser';
import { BaseOasEditor } from '../BaseOasEditor';
import { SpecTreeNode } from '../../../models';
import { DocFormat, OpenAPIV2 } from '@har-sdk/core';

export class OasV2Editor extends BaseOasEditor<OpenAPIV2.Document> {
  public async setup(source: string, format?: DocFormat): Promise<void> {
    return this.load(source, 'Bad Swagger/OpenAPI V2 specification', format);
  }

  public parse(): SpecTreeNode {
    this.tree = this.createRootNode([
      {
        paramType: 'variable',
        name: 'host',
        valueJsonPointer: '/host',
        value: this.doc.host
      }
    ]);

    return this.tree;
  }

  protected createPathItemObjectParser(): OasV2PathItemObjectParser {
    return new OasV2PathItemObjectParser(this.doc, this.dereferencedDoc);
  }
}
