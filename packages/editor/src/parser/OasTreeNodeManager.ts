import { SpecTreeNodeParser } from './SpecTreeNodeParser';
import { SpecTreeNode } from './SpecTreeNode';
import { HttpMethod } from './HttpMethod';
import { SpecTreeNodeSerializer } from './SpecTreeNodeSerializer';
import { SpecTreePathNode } from './SpecTreePathNode';
import { dump, load } from 'js-yaml';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';

type Document = OpenAPIV2.Document & OpenAPIV3.Document;
type Paths = OpenAPIV2.PathsObject & OpenAPIV3.PathsObject;
type PathItem = OpenAPIV2.PathItemObject & OpenAPIV3.PathItemObject;
type Operation = OpenAPIV2.OperationObject & OpenAPIV3.OperationObject;

type Endpoint = Operation & { path: string; method: string };

export class OasTreeNodeManager
  implements SpecTreeNodeParser, SpecTreeNodeSerializer
{
  public stringify(specTreeNode: SpecTreeNode): string {
    try {
      const { value, type } = this.parseCode<Document>(specTreeNode.code);
      const paths = this.preOrderVisit(specTreeNode);

      return this.stringifyCode({ ...value, paths }, type);
    } catch {
      throw new Error('Bad Swagger/OpenAPI specification');
    }
  }

  public parse(source: string): SpecTreeNode {
    try {
      const { value, type } = this.parseCode<Document>(source.trim());

      return this.createRootNode(value, type);
    } catch {
      throw new Error('Bad Swagger/OpenAPI specification');
    }
  }

  private preOrderVisit(specTreeNode: SpecTreeNode): Paths {
    return specTreeNode.children?.reduce(
      (result: Paths, treeNode: SpecTreeNode) => ({
        ...result,
        ...this.getPaths(treeNode)
      }),
      {} as Paths
    );
  }

  private getPaths(specTreeNode: SpecTreeNode): Paths {
    const endpoints = this.isHttpMethod(
      (specTreeNode as SpecTreePathNode).method
    )
      ? [specTreeNode]
      : specTreeNode.children;

    const groupedMethods = (endpoints ?? []).reduce(
      (entryMap: Map<string, SpecTreeNode[]>, node: SpecTreeNode) =>
        entryMap.set(node.name, [...(entryMap.get(node.name) || []), node]),
      new Map<string, SpecTreeNode[]>()
    );

    return Object.fromEntries(
      [...groupedMethods].map(([path, nodes]: [string, SpecTreeNode[]]) => [
        path,
        this.getPathMethods(nodes as SpecTreePathNode[])
      ])
    );
  }

  private getPathMethods(specTreeNode: SpecTreePathNode[]): PathItem {
    return Object.fromEntries(
      specTreeNode.map(({ method, code }) => [
        method.toLowerCase(),
        this.parseCode(code ?? '').value
      ])
    );
  }

  private traverse(document: Document, type: string): SpecTreeNode[] {
    const folderLookup = new Map<string, SpecTreeNode[]>(
      document.tags?.map((tag) => [tag.name ?? '', []]) ?? []
    );

    const endpoints = this.getEndpoints(document);

    endpoints.forEach((endpoint) => {
      const { method, path, ...rest } = endpoint;
      const node = new SpecTreePathNode({
        path,
        pointer: '',
        parameters: [],
        code: this.stringifyCode(rest, type),
        name: path,
        method: method.toUpperCase() as HttpMethod
      });

      (endpoint.tags ?? [node.name]).forEach((tag) => {
        const folder = folderLookup.get(tag);

        if (folder) {
          folder.push(node);
        } else {
          folderLookup.set(tag, [node]);
        }
      });
    });

    return [...folderLookup].map(
      ([name, children]: [string, SpecTreeNode[]]) =>
        // TODO pointer, code
        new SpecTreeNode({ name, children, pointer: null, code: null })
    );
  }

  private getEndpoints(document: Document): Endpoint[] {
    return Object.entries(document.paths).flatMap(
      ([path, paths]: [string, PathItem]) =>
        Object.entries(paths)
          .filter(([method]: [string, unknown]) => this.isHttpMethod(method))
          .map(([method, operation]: [string, unknown]) => ({
            ...(operation as Operation),
            path,
            method
          }))
    );
  }

  private isHttpMethod(method: string): boolean {
    return Object.values(HttpMethod).includes(
      method?.toUpperCase() as HttpMethod
    );
  }

  private stringifyCode(part: any, type: string): string {
    return type === 'yaml'
      ? dump(part, { indent: 2 })
      : JSON.stringify(part, null, 2);
  }

  private parseCode<T>(content: string): { value: T; type: 'json' | 'yaml' } {
    let value: T | undefined;
    let type: 'json' | 'yaml' | undefined;

    try {
      value = load(content, { json: true }) as unknown as T;
      type = 'yaml';
    } catch {
      // noop
    }

    if (!value) {
      try {
        value = JSON.parse(content);
        type = 'json';
      } catch {
        // noop
      }
    }

    if (!value || !type) {
      throw new Error('Bad Swagger/OpenAPI specification');
    }

    return { value, type };
  }

  private createRootNode(document: Document, type: string): SpecTreeNode {
    const { paths, ...metaInfo } = document;

    return new SpecTreeNode({
      pointer: '',
      name: document.info.title,
      code: this.stringifyCode(metaInfo as Document, type),
      children: this.traverse(document, type)
    });
  }
}
