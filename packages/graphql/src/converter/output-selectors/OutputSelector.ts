import {
  type IntrospectionInputValue,
  type IntrospectionNamedTypeRef,
  type IntrospectionOutputType,
  type IntrospectionSchema
} from '@har-sdk/core';

export interface OutputSelectorOptions {
  readonly schema: IntrospectionSchema;
  readonly visitedTypes: readonly string[];
  readonly addTypeName?: boolean;
  readonly excludeFields?: readonly string[];
}

export interface OutputSelectorData {
  readonly name: string;
  readonly typeRef: IntrospectionNamedTypeRef<IntrospectionOutputType>;
  readonly args: readonly IntrospectionInputValue[];
  readonly primitive: boolean;
  readonly options: OutputSelectorOptions;
  estimatedCost?: number;
}

export interface OutputSelector<T extends IntrospectionOutputType> {
  supportsType(
    typeRef: IntrospectionNamedTypeRef<IntrospectionOutputType>
  ): typeRef is IntrospectionNamedTypeRef<T>;

  select(
    typeRef: IntrospectionNamedTypeRef<IntrospectionOutputType>,
    options: OutputSelectorOptions
  ): OutputSelectorData[];
}
