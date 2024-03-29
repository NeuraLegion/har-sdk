import {
  OutputSelector,
  type OutputSelectorData,
  type OutputSelectorOptions
} from './OutputSelector';
import { isGraphQLPrimitive } from '../../utils';
import {
  type IntrospectionEnumType,
  type IntrospectionNamedTypeRef,
  type IntrospectionOutputTypeRef,
  type IntrospectionScalarType
} from '@har-sdk/core';

export class PrimitiveSelector
  implements OutputSelector<IntrospectionEnumType | IntrospectionScalarType>
{
  public supportsType(
    typeRef: IntrospectionOutputTypeRef
  ): typeRef is IntrospectionNamedTypeRef<
    IntrospectionEnumType | IntrospectionScalarType
  > {
    return isGraphQLPrimitive(typeRef);
  }

  public select(
    _typeRef: IntrospectionOutputTypeRef,
    _options: OutputSelectorOptions
  ): OutputSelectorData[] {
    return [];
  }
}
