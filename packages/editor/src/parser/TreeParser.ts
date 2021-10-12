import { SpecTreeNode } from '../models';

export interface TreeParser {
  setup(source: string): Promise<void>;
  parse(): SpecTreeNode;
}
