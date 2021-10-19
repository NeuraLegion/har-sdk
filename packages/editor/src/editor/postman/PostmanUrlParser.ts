import { SpecTreeNode } from '../../models';
import { Postman } from '@har-sdk/types';

export class PostmanUrlParser {
  public parse(url: Postman.Url | string): string {
    if (typeof url === 'string') {
      return url;
    }

    if (url.raw) {
      return url.raw;
    }

    const host: string = Array.isArray(url.host)
      ? url.host.join('.')
      : url.host || '';

    if (typeof url.path === 'string') {
      return `${host}/${url.path}`;
    }

    return url.path
      .map((pathItem: string | Postman.Variable) =>
        typeof pathItem === 'string' ? pathItem : pathItem.value ?? ''
      )
      .join('/');
  }

  public getGroupPath(children: ReadonlyArray<SpecTreeNode>): string {
    const childrenPaths = children.map((child) =>
      child.children?.length ? this.getGroupPath(child.children) : child.path
    );

    return this.getLongestCommonPath(childrenPaths);
  }

  private getLongestCommonPath(childrenPaths: string[]): string {
    let commonPath = childrenPaths[0].split('/');
    for (let i = 1; i < childrenPaths.length; ++i) {
      const childrenPath = childrenPaths[i].split('/');

      let j = 0;
      while (
        j < commonPath.length &&
        j < childrenPath.length &&
        childrenPath[j] === commonPath[j]
      ) {
        ++j;
      }

      commonPath = commonPath.slice(0, j);
    }

    return commonPath.join('/');
  }
}
