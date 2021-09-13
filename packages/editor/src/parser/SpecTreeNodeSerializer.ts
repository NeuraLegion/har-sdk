import { SpecTreeNode } from './SpecTreeNode';

export interface SpecTreeNodeSerializer {
  stringify(specTreeNode: SpecTreeNode): string;
}
