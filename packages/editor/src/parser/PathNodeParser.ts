import { SpecTreeNode } from '../models';

export interface PathNodeParser {
  parse(pointer: string): SpecTreeNode;
}
