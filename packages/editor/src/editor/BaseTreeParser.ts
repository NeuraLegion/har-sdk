import { SpecTreeNode } from '../models';
import { TreeParser } from './TreeParser';
import { dump, load } from 'js-yaml';

export abstract class BaseTreeParser<T> implements TreeParser {
  protected doc: T | undefined;
  protected tree: SpecTreeNode | undefined;
  protected format: 'yaml' | 'json' | undefined;

  public abstract setup(source: string): Promise<void>;
  public abstract parse(): SpecTreeNode;

  public stringify(): string {
    this.validateParsedSource();

    return this.format === 'yaml' ? dump(this.doc) : JSON.stringify(this.doc);
  }

  protected validateParsedSource(): void {
    if (!this.doc) {
      throw new Error('You have to call "parse" to initialize the document.');
    }
  }

  protected async load(source: string, errorMessage: string): Promise<void> {
    const result = await this.loadFromSource(source);

    if (!result) {
      throw new Error(errorMessage);
    }

    ({ doc: this.doc, format: this.format } = result);
  }

  private async loadFromSource(
    source: string
  ): Promise<{ doc: T; format: 'yaml' | 'json' }> {
    let doc: T | undefined;
    let json = true;

    try {
      doc = JSON.parse(source);
    } catch {
      // noop
    }
    if (!doc) {
      try {
        doc = load(source, { json: true }) as T;
        json = false;
      } catch {
        // noop
      }
    }

    return doc ? { doc, format: json ? 'json' : 'yaml' } : undefined;
  }
}
