import {
  type IntrospectionEnumType,
  type IntrospectionNamedTypeRef,
  type IntrospectionOutputTypeRef,
  type IntrospectionScalarType
} from '@har-sdk/core';

export const isGraphQLPrimitive = (
  typeRef: IntrospectionOutputTypeRef
): typeRef is IntrospectionNamedTypeRef<
  IntrospectionEnumType | IntrospectionScalarType
> => typeRef.kind === 'SCALAR' || typeRef.kind === 'ENUM';
