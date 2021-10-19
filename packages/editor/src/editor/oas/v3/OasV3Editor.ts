import { SpecTreeNode, SpecTreeNodeVariableParam } from '../../../models';
import { BaseOasEditor } from '../BaseOasEditor';
import { OasV3PathItemObjectParser } from './OasV3PathItemObjectParser';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { load } from 'js-yaml';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV3Editor extends BaseOasEditor<OpenAPIV3.Document> {
  public async setup(source: string): Promise<void> {
    try {
      this.doc = load(source, { json: true }) as OpenAPIV3.Document;
      this.dereferencedDoc = (await new $RefParser().dereference(
        load(source, { json: true })
      )) as OpenAPIV3.Document;
    } catch {
      throw new Error('Bad OpenAPI V3 specification');
    }
  }

  public parse(): SpecTreeNode {
    const servers: SpecTreeNodeVariableParam[] = [
      {
        paramType: 'variable',
        name: 'servers',
        valueJsonPointer: '/servers',
        value: this.doc.servers ? this.doc.servers : []
      }
    ];

    this.tree = {
      jsonPointer: '/',
      path: '/',
      name: this.doc.info.title,
      children: Object.keys(this.doc.paths).map((path: string) =>
        new OasV3PathItemObjectParser(this.doc, this.dereferencedDoc).parse(
          jsonPointer.compile(['paths', path])
        )
      ),
      parameters: servers
    };

    return this.tree;
  }
}
