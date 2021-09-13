import { ParamLocation, SpecTreeNodeParam } from '.';
import { HttpMethod } from './HttpMethod';
import { SpecTreeNode } from './SpecTreeNode';
import { SpecTreeNodeParser } from './SpecTreeNodeParser';
import { SpecTreeNodeSerializer } from './SpecTreeNodeSerializer';
import { SpecTreeParamNode } from './SpecTreeParamNode';
import { SpecTreePathNode } from './SpecTreePathNode';
import { Postman } from '@har-sdk/types';

export class PostmanTreeNodeManager
  implements SpecTreeNodeParser, SpecTreeNodeSerializer
{
  public stringify(specTreeNode: SpecTreeNode): string {
    try {
      const info = this.parseCode(specTreeNode);
      const item = this.traverseNodes(specTreeNode);

      return JSON.stringify({ info, item }, null, 2);
    } catch {
      throw new Error('Bad Postman collection');
    }
  }

  public parse(source: string): SpecTreeNode {
    try {
      const collection = JSON.parse(source.trim());

      return this.createRootNode(collection);
    } catch {
      throw new Error('Bad Postman collection');
    }
  }

  private createNodes(
    parentPointer: string,
    folder: Postman.ItemGroup
  ): SpecTreeNode[] {
    return folder.item.map(
      (x: Postman.ItemGroup | Postman.Item, idx: number) => {
        const pointer = `${parentPointer}/item/${idx}`;
        const code = JSON.stringify(x, null, 2);
        const name = x.name;

        if (this.isPathNode(x)) {
          const path =
            typeof x.request.url === 'string'
              ? x.request.url
              : x.request.url.raw;

          return new SpecTreePathNode({
            pointer,
            code,
            name,
            path,
            method: x.request.method.toUpperCase() as HttpMethod,
            parameters: [...this.createParameters(pointer, x)]
          });
        }

        if (this.isParamNode(x)) {
          return new SpecTreeParamNode({
            pointer,
            code,
            name,
            parameters: this.createParameters(pointer, x),
            children: this.createNodes(pointer, x)
          });
        }

        return new SpecTreeNode({
          pointer,
          code,
          name,
          children: this.createNodes(pointer, x)
        });
      }
    );
  }

  private createParameters(
    parentPointer: string,
    folder: Postman.VariableScope,
    location?: ParamLocation
  ): SpecTreeNodeParam[] {
    return (folder.variable || []).map((x: Postman.Variable, idx: number) => {
      const pointer = `${parentPointer}/variable/${idx}`;

      return new SpecTreeNodeParam({
        pointer,
        location,
        name: x.name,
        value: x.value,
        type: x.value
      });
    });
  }

  private createRootNode(collection: Postman.Document): SpecTreeNode {
    const pointer = '';

    return new SpecTreeNode({
      pointer,
      name: collection.info.name,
      code: JSON.stringify(collection.info, null, 2),
      children: this.createNodes(pointer, collection)
    });
  }

  private parseCode<T>(specTreeNode: SpecTreeNode): T {
    return JSON.parse(specTreeNode.code);
  }

  private traverseNodes(
    specTreeNode: SpecTreeNode
  ): (Postman.Item | Postman.ItemGroup)[] {
    return specTreeNode.children?.flatMap((node) =>
      node.children?.length ? this.traverseNodes(node) : this.parseCode(node)
    );
  }

  private isParamNode(x: any): x is Postman.VariableScope {
    return Array.isArray(x.variable);
  }

  private isPathNode(x: any): x is Postman.Item {
    return x.request !== undefined;
  }
}
