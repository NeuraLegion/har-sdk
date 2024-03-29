import { InputSampler, type InputSamplerOptions } from './InputSampler';
import {
  type IntrospectionInputTypeRef,
  type IntrospectionListTypeRef
} from '@har-sdk/core';

export class GraphQLListSampler implements InputSampler {
  public supportsType(
    typeRef: IntrospectionInputTypeRef
  ): typeRef is IntrospectionListTypeRef<IntrospectionInputTypeRef> {
    return 'kind' in typeRef && typeRef.kind === 'LIST';
  }

  public sample(
    typeRef: IntrospectionInputTypeRef,
    options: InputSamplerOptions
  ): string | undefined {
    if (!this.supportsType(typeRef)) {
      return undefined;
    }

    const { pointer, inputSamplers } = options;

    try {
      pointer.push('0');
      const sample = inputSamplers
        .find(typeRef.ofType)
        ?.sample(typeRef.ofType, options);

      return sample !== undefined ? `[${sample}]` : sample;
    } finally {
      pointer.pop();
    }
  }
}
