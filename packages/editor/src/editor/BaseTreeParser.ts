import { SpecTreeNode } from '../models';
import { TreeParser, Document } from './TreeParser';
import { DocFormat } from '@har-sdk/core';
import { dump, load } from 'js-yaml';

export abstract class BaseTreeParser<T extends Document = Document>
  implements TreeParser<T>
{
  private _doc: T | undefined;
  private _format: DocFormat | undefined;
  private _tree: SpecTreeNode | undefined;

  get doc(): T | undefined {
    if (!this._doc) {
      throw new Error('You have to call "setup" to initialize the document');
    }

    return this._doc;
  }

  get format(): DocFormat | undefined {
    if (!this._doc) {
      throw new Error('You have to call "setup" to initialize the document');
    }

    return this._format;
  }

  get tree(): SpecTreeNode | undefined {
    if (!this._tree) {
      throw new Error('You have to call "parse" to initialize the tree');
    }

    return this._tree;
  }

  set tree(tree: SpecTreeNode) {
    this._tree = tree;
  }

  public abstract setup(source: string, format?: DocFormat): Promise<void>;
  public abstract parse(): SpecTreeNode;

  public stringify(): string {
    return this.format === 'yaml' ? dump(this.doc) : JSON.stringify(this.doc);
  }

  protected async load(source: string, format?: DocFormat): Promise<boolean> {
    const result = await this.loadFromSource(source, format);

    if (result) {
      ({ doc: this._doc, format: this._format } = result);
    }

    return !!result;
  }

  private async loadFromSource(
    source: string,
    format?: DocFormat
  ): Promise<{ doc: T; format: DocFormat } | undefined> {
    let doc: T | undefined;

    if ((!format || format === 'json') && (doc = this.loadFromJson(source))) {
      return { doc, format: 'json' };
    }

    if ((!format || format === 'yaml') && (doc = this.loadFromYaml(source))) {
      return { doc, format: 'yaml' };
    }

    return undefined;
  }

  private loadFromJson(source: string): T | undefined {
    try {
      return JSON.parse(source);
    } catch {
      // noop
    }
  }

  private loadFromYaml(source: string): T | undefined {
    try {
      return load(source, { json: true }) as T;
    } catch {
      // noop
    }
  }
}
