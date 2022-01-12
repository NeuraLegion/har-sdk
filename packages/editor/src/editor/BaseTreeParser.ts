import { SpecTreeNode } from '../models';
import { TreeParser, Document } from './TreeParser';
import { DocFormat } from '@har-sdk/core';
import { dump, load } from 'js-yaml';

type LoadResult<T> = { doc: T; format: DocFormat };

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
    const result = await this.loadFromSource(source, format);

    ({ doc: this._doc, format: this._format } = result || {
      doc: undefined,
      format: undefined
    });

    if (!result) {
      throw new Error(errorMessage);
    }
  }

  private async loadFromSource(
    source: string,
    format?: DocFormat
  ): Promise<LoadResult<T> | undefined> {
    const docFormats: DocFormat[] = ['json', 'yaml'];

    return docFormats.reduce(
      (res: LoadResult<T> | undefined, docFormat: DocFormat) => {
        if (res || (format && format !== docFormat)) {
          return res;
        }

        const doc = this.loadFrom(source, docFormat);
        if (doc) {
          return { doc, format: docFormat };
        }
      },
      undefined
    );
  }

  private loadFrom(source: string, format: DocFormat): T | undefined {
    try {
      if (format === 'json') {
        return JSON.parse(source);
      } else {
        return load(source, { json: true }) as T;
      }
    } catch {
      // noop
    }
  }
}
