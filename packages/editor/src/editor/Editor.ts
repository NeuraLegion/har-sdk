import { SpecTreeNode } from '../models';

export interface Editor {
  setParameterValue(jsonPointer: string, value: any): SpecTreeNode;
  removeNode(jsonPointer: string): SpecTreeNode;
}
