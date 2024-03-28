import {
  GraphQL,
  IntrospectionDirective,
  IntrospectionField,
  IntrospectionInputValue,
  IntrospectionInterfaceType,
  IntrospectionObjectType,
  IntrospectionType,
  IntrospectionNamedTypeRef,
  IntrospectionSchema
} from '../types';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
type DpDw<T> = DeepPartial<DeepWriteable<T>>;

export class GraphQLNormalizer {
  public normalize(input: GraphQL.Document): GraphQL.Document {
    const schema = (input as DpDw<GraphQL.Document>).data?.__schema;

    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      return input;
    }

    const result = JSON.parse(JSON.stringify(input)) as DpDw<GraphQL.Document>;

    this.normalizeSchema(result.data.__schema);

    return result as GraphQL.Document;
  }

  private normalizeSchema(
    schema: DeepPartial<DeepWriteable<IntrospectionSchema>>
  ) {
    this.normalizeTypeRef(schema.queryType);
    this.normalizeTypeRef(schema.mutationType);
    this.normalizeTypeRef(schema.subscriptionType);

    this.normalizeDirectives(schema);
    this.normalizeTypes(schema);
  }

  private normalizeTypeRef(
    typeRef: DpDw<IntrospectionNamedTypeRef<IntrospectionObjectType>>
  ) {
    if (!!typeRef && typeof typeRef === 'object' && !Array.isArray(typeRef)) {
      typeRef.kind ??= 'OBJECT';
    }
  }

  private normalizeTypes(obj: { types?: DpDw<IntrospectionType>[] }): void {
    obj.types ??= [];
    if (Array.isArray(obj.types)) {
      obj.types.forEach((t) => this.normalizeType(t));
    }
  }

  private normalizeType(type: DpDw<IntrospectionType>) {
    if (this.isTypeKind('OBJECT', type)) {
      this.normalizeFields(type);
      this.normalizeInterfaces(type);
    }

    if (this.isTypeKind('INTERFACE', type)) {
      this.normalizeFields(type);
      this.normalizeInterfaces(type);
      this.normalizePossibleTypes(type);
    }

    if (this.isTypeKind('UNION', type)) {
      this.normalizePossibleTypes(type);
    }

    if (this.isTypeKind('INPUT_OBJECT', type)) {
      this.normalizeInputFields(type);
    }
  }

  private normalizeDirectives(obj: {
    directives?: DpDw<IntrospectionDirective>[];
  }) {
    obj.directives ??= [];
    if (Array.isArray(obj.directives)) {
      obj.directives.forEach((directive) => this.normalizeArgs(directive));
    }
  }
  private normalizeFields(obj: { fields?: DpDw<IntrospectionField>[] }) {
    obj.fields ??= [];
    if (Array.isArray(obj.fields)) {
      obj.fields.forEach((field) => this.normalizeArgs(field));
    }
  }

  private normalizeInterfaces(obj: {
    interfaces?: DpDw<IntrospectionInterfaceType>[];
  }) {
    obj.interfaces ??= [];
  }

  private normalizePossibleTypes(obj: {
    possibleTypes?: DpDw<IntrospectionObjectType>[];
  }) {
    obj.possibleTypes ??= [];
  }

  private normalizeInputFields(obj: {
    inputFields?: DpDw<IntrospectionInputValue>[];
  }) {
    obj.inputFields ??= [];
  }

  private normalizeArgs(obj: { args?: DpDw<IntrospectionInputValue>[] }) {
    obj.args ??= [];
  }

  private isTypeKind<
    T extends IntrospectionType['kind'],
    U extends IntrospectionType
  >(kind: T, type: DpDw<U>): type is DpDw<Extract<U, { kind: T }>> {
    return typeof type === 'object' && 'kind' in type && type.kind === kind;
  }
}
