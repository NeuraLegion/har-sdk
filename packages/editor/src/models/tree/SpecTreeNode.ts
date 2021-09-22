import { SpecTreeNodeParam } from './SpecTreeNodeParam';
import { HttpMethod } from '../HttpMethod';

export interface SpecTreeNode {
  readonly path: string;
  readonly name?: string;
  readonly method?: HttpMethod;
  readonly jsonPointer: string;
  readonly children?: ReadonlyArray<SpecTreeNode>;
  readonly parameters?: ReadonlyArray<SpecTreeNodeParam>;
}
