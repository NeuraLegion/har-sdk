import { type InputSampler } from './InputSampler';
import { type IntrospectionInputTypeRef } from '@har-sdk/core';

export interface InputSamplers {
  find(typeRef: IntrospectionInputTypeRef): InputSampler | undefined;
}
