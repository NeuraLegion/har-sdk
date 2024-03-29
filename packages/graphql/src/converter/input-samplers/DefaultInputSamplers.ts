import { InputSamplers } from './InputSamplers';
import { InputSampler } from './InputSampler';
import { InputObjectSampler } from './InputObjectSampler';
import { EnumSampler } from './EnumSampler';
import { GraphQLListSampler } from './ListSampler';
import { NonNullSampler } from './NonNullSampler';
import { UploadScalarSampler } from './UploadScalarSampler';
import { type IntrospectionInputTypeRef } from '@har-sdk/core';

export class DefaultInputSamplers implements InputSamplers {
  constructor(
    private readonly inputSamplers: InputSampler[] = [
      new GraphQLListSampler(),
      new NonNullSampler(),
      new InputObjectSampler(),
      new EnumSampler(),
      new UploadScalarSampler()
    ]
  ) {}

  public find(typeRef: IntrospectionInputTypeRef): InputSampler | undefined {
    return this.inputSamplers.find((s) => s.supportsType(typeRef));
  }
}
