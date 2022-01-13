import { SpecTreeNode } from '../models';
import { TreeParser, Document } from './TreeParser';
import { DocFormat, SpecImporter } from '@har-sdk/core';
import { dump } from 'js-yaml';

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

  protected async load(
    source: string,
    errorMessage: string,
    format?: DocFormat
  ): Promise<void> {
    const importer = new SpecImporter();
    const spec = await importer.import(source, format);

    this._doc = spec?.doc as T;
    this._format = spec?.format;

    if (!spec) {
      throw new Error(errorMessage);
    }
  }
}
