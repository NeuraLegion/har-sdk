import { SpecTreeNode } from '../models';
import { TreeParser } from './TreeParser';
import { dump, load } from 'js-yaml';

export abstract class BaseTreeParser<T> implements TreeParser {
  protected doc: T;
  protected tree: SpecTreeNode;
  protected format: 'yaml' | 'json';

  public abstract setup(source: string): Promise<void>;
  public abstract parse(): SpecTreeNode;

  public stringify(): string {
    return this.format === 'yaml' ? dump(this.doc) : JSON.stringify(this.doc);
  }

  protected async load(source: string, errorMessage: string): Promise<void> {
    try {
      await this.loadFromSource(source);
    } catch {
      throw new Error(errorMessage);
    }
  }

  private async loadFromSource(source: string): Promise<void> {
    try {
      this.doc = JSON.parse(source);
      this.format = 'json';

      return;
    } catch {
      // noop
    }

    this.doc = load(source, { json: true }) as T;
    this.format = 'yaml';
  }
}
