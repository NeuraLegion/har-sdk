import { SpecTreeNode, HttpMethod } from '../../models';
import { BaseEditor } from '../BaseEditor';
import { PostmanParametersParser } from './ParametersParser';
import { PostmanUrlParser } from './PostmanUrlParser';
import { VariablesParser } from './VariablesParser';
import { Postman } from '@har-sdk/types';

export class PostmanEditor extends BaseEditor<Postman.Document> {
  private readonly postmanUrlParser = new PostmanUrlParser();

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

        const parameters = new PostmanParametersParser(this.doc).parse(
          itemJsonPointer
        );

        if (this.isItemGroup(x)) {
          const children = this.createNodes(x, itemJsonPointer);

          return {
            jsonPointer: itemJsonPointer,
            path: this.postmanUrlParser.getGroupPath(children),
            children,
            ...(parameters?.length ? { parameters } : {})
          };
        }

        return {
          jsonPointer: itemJsonPointer,
          path: this.postmanUrlParser.parse(x.request?.url),
          method: x.request.method as HttpMethod,
          ...(parameters?.length ? { parameters } : {})
        };
      }
    );
  }

  private isItemGroup(
    x: Postman.Item | Postman.ItemGroup
  ): x is Postman.ItemGroup {
    return Array.isArray((x as Postman.ItemGroup).item);
  }
}
