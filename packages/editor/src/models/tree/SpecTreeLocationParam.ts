import { ParamLocation } from '../ParamLocation';
import { SpecTreeNodeParam } from './SpecTreeNodeParam';

export interface SpecTreeLocationParam extends SpecTreeNodeParam {
  readonly paramType: 'location';
  readonly name: string;
  readonly location: ParamLocation;
}
