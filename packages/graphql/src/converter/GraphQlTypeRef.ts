import {
  type IntrospectionInputType,
  type IntrospectionInputTypeRef,
  type IntrospectionListTypeRef,
  type IntrospectionNamedTypeRef,
  type IntrospectionNonNullTypeRef,
  type IntrospectionOutputType,
  type IntrospectionOutputTypeRef
} from '@har-sdk/core';

export class GraphQlTypeRef<
  TypeRef extends IntrospectionOutputTypeRef | IntrospectionInputTypeRef,
  Type extends TypeRef extends IntrospectionOutputTypeRef
    ? IntrospectionOutputType
    : IntrospectionInputType
> {
  public readonly typeRef: IntrospectionNamedTypeRef<Type>;

  get type(): string {
    return this.stringify(this.originalTypeRef);
  }

  private readonly originalTypeRef: TypeRef;

  constructor(typeRef: TypeRef) {
    this.originalTypeRef = typeRef;
    this.typeRef = this.unwrap(typeRef);
  }

  private unwrap(typeRef: TypeRef): IntrospectionNamedTypeRef<Type> {
    if (this.isNonNullTypeRef(typeRef)) {
      return this.unwrap(typeRef.ofType);
    }

    if (this.isListTypeRef(typeRef)) {
      return this.unwrap(typeRef.ofType);
    }

    return typeRef as IntrospectionNamedTypeRef<Type>;
  }

  private stringify(typeRef: TypeRef): string {
    if (this.isNonNullTypeRef(typeRef)) {
      return `${this.stringify(typeRef.ofType)}!`;
    }

    if (this.isListTypeRef(typeRef)) {
      return `[${this.stringify(typeRef.ofType)}]`;
    }

    return (typeRef as IntrospectionNamedTypeRef<Type>).name;
  }

  private isNonNullTypeRef(
    type: object
  ): type is IntrospectionNonNullTypeRef<TypeRef> {
    return (
      'kind' in type &&
      (type as IntrospectionNonNullTypeRef).kind === 'NON_NULL'
    );
  }

  private isListTypeRef(
    type: object
  ): type is IntrospectionListTypeRef<TypeRef> {
    return 'kind' in type && (type as IntrospectionListTypeRef).kind === 'LIST';
  }
}
