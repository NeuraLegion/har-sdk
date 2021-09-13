import { SpecTreeNode } from './SpecTreeNode';

export interface SpecTreeNodeParser {
  parse(collection: string): SpecTreeNode;
}
