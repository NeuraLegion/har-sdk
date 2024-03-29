import { InputSampler, type InputSamplerOptions } from './InputSampler';
import { GraphQlTypeRef } from '../GraphQlTypeRef';
import {
  type IntrospectionInputTypeRef,
  type IntrospectionInputObjectType,
  type IntrospectionInputType,
  type IntrospectionNamedTypeRef,
  type IntrospectionSchema
} from '@har-sdk/core';

export class InputObjectSampler implements InputSampler {
  public supportsType(
    typeRef: IntrospectionInputTypeRef
  ): typeRef is IntrospectionNamedTypeRef<IntrospectionInputObjectType> {
    return 'kind' in typeRef && typeRef.kind === 'INPUT_OBJECT';
  }

  public sample(
    typeRef: IntrospectionInputTypeRef,
    options: InputSamplerOptions
  ): string | undefined {
    if (!this.supportsType(typeRef)) {
      return undefined;
    }

    const { schema, visitedTypes } = options;

    const type = this.findType(schema, typeRef);

    if (!type) {
      return undefined;
    }

    visitedTypes.push(type.name);

    try {
      const sample = this.sampleFields(type, options).join(', ');

      return sample ? `{${sample}}` : undefined;
    } finally {
      visitedTypes.pop();
    }
  }

  private sampleFields(
    type: IntrospectionInputObjectType,
    options: InputSamplerOptions
  ) {
    const { inputSamplers, visitedTypes, pointer } = options;

    return type.inputFields
      .map((field) => {
        const resolvedTypeRef = new GraphQlTypeRef(field.type);
        const { typeRef } = resolvedTypeRef;

        const visited = visitedTypes.includes(typeRef.name);

        if (visited) {
          return undefined;
        }

        if (field.defaultValue !== undefined && field.defaultValue !== null) {
          return field.defaultValue;
        }

        try {
          pointer.push(field.name);

          const sample = inputSamplers
            .find(field.type)
            ?.sample(field.type, options);

          return sample ? `${field.name}: ${sample}` : sample;
        } finally {
          pointer.pop();
        }
      })
      .filter((field): field is string => !!field);
  }

  private findType(
    schema: IntrospectionSchema,
    typeRef: IntrospectionNamedTypeRef<IntrospectionInputType>
  ) {
    const [introspectionInputObjectType]: IntrospectionInputObjectType[] =
      schema.types.filter(
        (type): type is IntrospectionInputObjectType =>
          type.kind === 'INPUT_OBJECT' && type.name === typeRef.name
      );

    return introspectionInputObjectType;
  }
}
