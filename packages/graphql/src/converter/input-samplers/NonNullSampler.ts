import { InputSampler, type InputSamplerOptions } from './InputSampler';
import {
  type IntrospectionInputTypeRef,
  type IntrospectionListTypeRef,
  type IntrospectionNamedTypeRef,
  type IntrospectionInputType,
  type IntrospectionNonNullTypeRef
} from '@har-sdk/core';

export class NonNullSampler implements InputSampler {
  public supportsType(
    typeRef: IntrospectionInputTypeRef
  ): typeRef is IntrospectionNonNullTypeRef<
    | IntrospectionNamedTypeRef<IntrospectionInputType>
    | IntrospectionListTypeRef<IntrospectionInputTypeRef>
  > {
    return 'kind' in typeRef && typeRef.kind === 'NON_NULL';
  }

  public sample(
    typeRef: IntrospectionInputTypeRef,
    options: InputSamplerOptions
  ): string | undefined {
    if (!this.supportsType(typeRef)) {
      return undefined;
    }

    const { inputSamplers } = options;

    return inputSamplers.find(typeRef.ofType)?.sample(typeRef.ofType, options);
  }
}
