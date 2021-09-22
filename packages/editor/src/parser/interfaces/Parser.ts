import { SpecTreeNode } from '../../models';

export interface TreeParser {
  parse(): SpecTreeNode;
}
