import { SpecTreeNode } from '../../models';
import { SpecTreeNodeVariableParam } from '../../models/tree/SpecTreeNodeVariableParam';
import { TreeParser } from '../TreeParser';
import { PathItemObjectParser } from './PathItemObjectParser';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import jsonPointer from 'json-pointer';
import { load } from 'js-yaml';
import { OpenAPIV2 } from '@har-sdk/types';

export class OpenApiV2Parser implements TreeParser {
  protected doc: OpenAPIV2.Document;
  protected dereferencedDoc: OpenAPIV2.Document;
  protected tree: SpecTreeNode;

  public async setup(source: string): Promise<void> {
    try {
      this.doc = load(source, { json: true }) as OpenAPIV2.Document;
      this.dereferencedDoc = (await new $RefParser().dereference(
        load(source, { json: true })
      )) as OpenAPIV2.Document;
    } catch (e) {
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
        new PathItemObjectParser(this.doc, this.dereferencedDoc).parse(
          jsonPointer.compile(['paths', path])
        )
      ),
      parameters: servers
    };

    return this.tree;
  }
}
