import { SpecTreeNodeParam } from './SpecTreeNodeParam';

export interface SpecTreeNodeVariableParam extends SpecTreeNodeParam {
  readonly paramType: 'variable';
  readonly name: string;
}
