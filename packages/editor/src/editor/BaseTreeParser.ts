import { SpecTreeNode } from '../models';
import { TreeParser } from './TreeParser';
import { dump, load } from 'js-yaml';

export abstract class BaseTreeParser<T> implements TreeParser {
  private _doc: T | undefined;
  private _format: 'yaml' | 'json' | undefined;
  private _tree: SpecTreeNode | undefined;

  get doc(): T | undefined {
    if (!this._doc) {
      throw new Error('You have to call "setup" to initialize the document');
    }

    return this._doc;
  }

  get format(): 'yaml' | 'json' | undefined {
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

  public abstract setup(source: string): Promise<void>;
  public abstract parse(): SpecTreeNode;

  public stringify(): string {
    return this.format === 'yaml' ? dump(this.doc) : JSON.stringify(this.doc);
  }

  protected async load(source: string, errorMessage: string): Promise<void> {
    const result = await this.loadFromSource(source);

    if (!result) {
      throw new Error(errorMessage);
    }

    ({ doc: this._doc, format: this._format } = result);
  }

  private async loadFromSource(
    source: string
  ): Promise<{ doc: T; format: 'yaml' | 'json' } | undefined> {
    let doc: T | undefined = this.loadFromJson(source);
    let json = true;

    if (!doc) {
      doc = this.loadFromYaml(source);
      json = false;
    }

    return doc ? { doc, format: json ? 'json' : 'yaml' } : undefined;
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
