import { OasV2PathItemObjectParser } from './OasV2PathItemObjectParser';
import { BaseOasEditor } from '../BaseOasEditor';
import { SpecTreeNode, SpecTreeNodeVariableParam } from '../../../models';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { OpenAPIV2 } from '@har-sdk/types';
import { load } from 'js-yaml';
import jsonPointer from 'json-pointer';

export class OasV2Editor extends BaseOasEditor<OpenAPIV2.Document> {
  public async setup(source: string): Promise<void> {
    try {
      this.doc = load(source, { json: true }) as OpenAPIV2.Document;
      this.dereferencedDoc = (await new $RefParser().dereference(
        load(source, { json: true })
      )) as OpenAPIV2.Document;
    } catch {
      throw new Error('Bad Swagger/OpenAPI V2 specification');
    }
  }

  public parse(): SpecTreeNode {
    const servers: SpecTreeNodeVariableParam[] = [
      {
        paramType: 'variable',
        name: 'host',
        valueJsonPointer: '/host',
        value: this.doc.host
      }
    ];

    this.tree = {
      jsonPointer: '/',
      path: '/',
      name: this.doc.info.title,
      children: Object.keys(this.doc.paths).map((path: string) =>
        new OasV2PathItemObjectParser(this.doc, this.dereferencedDoc).parse(
          jsonPointer.compile(['paths', path])
        )
      ),
      parameters: servers
    };

    return this.tree;
  }
}
