import { SpecTreeNodeParam } from '../../models';

export interface ParametersParser {
  parse(pointer: string): SpecTreeNodeParam[];
}
