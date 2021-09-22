import { SpecTreeNode } from '../../models';
import { SpecTreeNodeVariableParam } from '../../models/tree/SpecTreeNodeVariableParam';
import { TreeParser } from '../interfaces/Parser';
import { PathItemObjectParser } from './PathItemObjectParser';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import jsonPointer from 'json-pointer';
import { load } from 'js-yaml';
import { OpenAPIV3 } from '@har-sdk/types';

export class OpenApiV3Parser implements TreeParser {
  protected doc: OpenAPIV3.Document;
  protected dereferencedDoc: OpenAPIV3.Document;
  protected tree: SpecTreeNode;

  public async setup(source: string): Promise<void> {
    try {
      this.doc = load(source, { json: true }) as OpenAPIV3.Document;
      this.dereferencedDoc = (await new $RefParser().dereference(
        load(source, { json: true })
      )) as OpenAPIV3.Document;
    } catch (e) {
      throw new Error('Bad Swagger/OpenAPI specification');
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
        new PathItemObjectParser(this.doc, this.dereferencedDoc).parse(
          jsonPointer.compile(['paths', path])
        )
      ),
      parameters: servers
    };

    return this.tree;
  }
}
