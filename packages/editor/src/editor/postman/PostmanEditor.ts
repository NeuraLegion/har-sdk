import { SpecTreeNode, HttpMethod, SpecTreeNodeParam } from '../../models';
import { BaseEditor } from '../BaseEditor';
import { PostmanParametersParser } from './PostmanParametersParser';
import { PostmanUrlParser } from './PostmanUrlParser';
import { PostmanVariablesParser } from './PostmanVariablesParser';
import { Postman } from '@har-sdk/types';

export class PostmanEditor extends BaseEditor<Postman.Document> {
  private readonly postmanUrlParser = new PostmanUrlParser();

  public setup(source: string): Promise<void> {
    return this.load(source, 'Bad Postman collection');
  }

  public parse(): SpecTreeNode {
    const parameters = new PostmanVariablesParser(this.doc).parse('/variable');

    this.tree = {
      jsonPointer: '/',
      path: '/',
      name: this.doc.info.name,
      children: this.createNodes(this.doc, ''),
      ...(parameters?.length ? { parameters } : {})
    };

    return this.tree;
  }

  private createNodes(
    folder: Postman.ItemGroup,
    groupJsonPointer: string
  ): SpecTreeNode[] {
    return folder.item.flatMap(
      (x: Postman.ItemGroup | Postman.Item, idx: number): SpecTreeNode[] => {
        const itemJsonPointer = `${groupJsonPointer}/item/${idx.toString(10)}`;

        const parameters = new PostmanParametersParser(this.doc).parse(
          itemJsonPointer
        );

        if (this.isItemGroup(x)) {
          return [this.createGroupNode(x, itemJsonPointer, parameters)];
        }

        const node = this.createSingleNode(x, itemJsonPointer, parameters);

        return node ? [node] : [];
      }
    );
  }

  private isItemGroup(
    x: Postman.Item | Postman.ItemGroup
  ): x is Postman.ItemGroup {
    return Array.isArray((x as Postman.ItemGroup).item);
  }

  private createGroupNode(
    itemGroup: Postman.ItemGroup,
    pointer: string,
    parameters: SpecTreeNodeParam[]
  ): SpecTreeNode {
    const children = this.createNodes(itemGroup, pointer);

    return {
      jsonPointer: pointer,
      path: this.postmanUrlParser.getGroupPath(children),
      children,
      ...(parameters?.length ? { parameters } : {})
    };
  }

  private createSingleNode(
    item: Postman.Item,
    pointer: string,
    parameters: SpecTreeNodeParam[]
  ): SpecTreeNode {
    return {
      jsonPointer: pointer,
      path: this.postmanUrlParser.parse(item.request.url),
      method: item.request.method.toUpperCase() as HttpMethod,
      ...(parameters?.length ? { parameters } : {})
    };
  }
}
