import { ParameterObject } from '../../types';

export interface LocationParam<T extends ParameterObject> {
  readonly param: T;
  readonly value: unknown;
  readonly jsonPointer: string;
}
