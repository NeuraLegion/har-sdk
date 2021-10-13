import { TreeParser } from '../TreeParser';
import { SpecTreeNode, HttpMethod } from '../../models';
import { VariablesParser } from './VariablesParser';
import { Postman } from '@har-sdk/types';

export class PostmanParser implements TreeParser {
  protected doc: Postman.Document;
  protected tree: SpecTreeNode;

  public async setup(source: string): Promise<void> {
    try {
      this.doc = JSON.parse(source) as Postman.Document;
    } catch {
      throw new Error('Bad Postman collection');
    }
  }

  public parse(): SpecTreeNode {
    this.tree = {
      jsonPointer: '/',
      path: '/',
      name: this.doc.info.name,
      children: this.createNodes(this.doc, ''),
      parameters: new VariablesParser(this.doc).parse('/variable')
    };

    return this.tree;
  }

  private createNodes(
    folder: Postman.ItemGroup,
    groupJsonPointer: string
  ): SpecTreeNode[] {
    return folder.item.map(
      (x: Postman.ItemGroup | Postman.Item, idx: number): SpecTreeNode => {
        const itemJsonPointer = `${groupJsonPointer}/item/${idx.toString(10)}`;

        const parameters = new VariablesParser(this.doc).parse(
          `${itemJsonPointer}/variable`
        );

        return {
          // TODO improve path parsing
          path: ((x as Postman.Item)?.request?.url as Postman.Url)?.raw || '/',
          jsonPointer: itemJsonPointer,
          ...(Array.isArray((x as Postman.ItemGroup).item)
            ? {
                children: this.createNodes(
                  x as Postman.ItemGroup,
                  itemJsonPointer
                )
              }
            : { method: (x as Postman.Item).request.method as HttpMethod }),
          ...(parameters ? { parameters } : {})
        };
      }
    );
  }
}
