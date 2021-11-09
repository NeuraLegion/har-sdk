import { SpecTreeNodeParam } from './SpecTreeNodeParam';

export interface SpecTreeRequestBodyParam extends SpecTreeNodeParam {
  readonly paramType: 'requestBody';
  readonly bodyType: string;
}
