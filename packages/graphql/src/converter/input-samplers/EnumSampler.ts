import { InputSampler, type InputSamplerOptions } from './InputSampler';
import {
  type IntrospectionEnumType,
  type IntrospectionEnumValue,
  type IntrospectionInputTypeRef,
  type IntrospectionNamedTypeRef
} from '@har-sdk/core';

export class EnumSampler implements InputSampler {
  public supportsType(
    typeRef: IntrospectionInputTypeRef
  ): typeRef is IntrospectionNamedTypeRef<IntrospectionEnumType> {
    return 'kind' in typeRef && typeRef.kind === 'ENUM';
  }

  public sample(
    typeRef: IntrospectionInputTypeRef,
    { schema }: InputSamplerOptions
  ): string | undefined {
    if (!this.supportsType(typeRef)) {
      return undefined;
    }

    return schema.types
      .filter(
        (type): type is IntrospectionEnumType => type.name === typeRef.name
      )
      .map((type) => {
        const [value]: readonly IntrospectionEnumValue[] = type.enumValues;

        return value ? value.name : 'null';
      })
      .join('');
  }
}
