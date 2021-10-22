import { SpecTreeNode } from '../models';
import { TreeParser } from './TreeParser';

export abstract class BaseTreeParser<T> implements TreeParser {
  protected doc: T;
  protected tree: SpecTreeNode;

  public abstract setup(source: string): Promise<void>;
  public abstract parse(): SpecTreeNode;

  public stringify(): string {
    return JSON.stringify(this.doc);
  }
}
