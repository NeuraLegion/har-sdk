import {
  type OutputSelector,
  type OutputSelectorData,
  type OutputSelectorOptions
} from './OutputSelector';
import { GraphQlTypeRef } from '../GraphQlTypeRef';
import { isGraphQLPrimitive } from '../../utils';
import {
  type IntrospectionField,
  type IntrospectionInterfaceType,
  type IntrospectionNamedTypeRef,
  type IntrospectionObjectType,
  type IntrospectionOutputType,
  type IntrospectionOutputTypeRef,
  type IntrospectionSchema
} from '@har-sdk/core';

export abstract class AbstractSelector<T extends IntrospectionOutputType>
  implements OutputSelector<T>
{
  protected constructor(private readonly kind: string) {}

  protected abstract buildFields(
    type: T,
    options: OutputSelectorOptions
  ): OutputSelectorData[];

  public supportsType(
    typeRef: IntrospectionOutputTypeRef
  ): typeRef is IntrospectionNamedTypeRef<T> {
    return 'kind' in typeRef && typeRef.kind === this.kind;
  }

  public select(
    typeRef: IntrospectionOutputTypeRef,
    options: OutputSelectorOptions
  ): OutputSelectorData[] {
    if (!this.supportsType(typeRef)) {
      return [];
    }

    const { schema } = options;

    const findType = this.findType(schema, typeRef);

    if (!findType) {
      return [];
    }

    return this.trackVisitedTypes(findType, options);
  }

  protected selectOwnFields(
    type: IntrospectionObjectType | IntrospectionInterfaceType,
    options: OutputSelectorOptions
  ): OutputSelectorData[] {
    const { visitedTypes, excludeFields, addTypeName } = options;

    const nodes = type.fields
      .map((field: IntrospectionField): OutputSelectorData | undefined => {
        const { typeRef } = new GraphQlTypeRef(field.type);

        const visited = visitedTypes.includes(typeRef.name);

        const excluded = !!excludeFields?.includes(field.name);

        if (excluded || visited) {
          return undefined;
        }

        return {
          typeRef,
          args: field.args,
          primitive: isGraphQLPrimitive(typeRef),
          name: `${field.name}`,
          options: {
            ...options,
            addTypeName: false,
            excludeFields: undefined
          }
        };
      })
      .filter((node): node is OutputSelectorData => !!node);

    return nodes.length && addTypeName
      ? this.addTypeNameField(options, nodes)
      : nodes;
  }

  protected trackVisitedTypes(
    type: T,
    options: OutputSelectorOptions
  ): OutputSelectorData[] {
    const { visitedTypes } = options;

    return this.buildFields(type, {
      ...options,
      visitedTypes: [...visitedTypes, type.name]
    });
  }

  protected findType(
    schema: IntrospectionSchema,
    typeRef: IntrospectionNamedTypeRef<T>
  ): T | undefined {
    const [introspectionType]: T[] = schema.types.filter(
      (type): type is T => type.kind === this.kind && type.name === typeRef.name
    );

    return introspectionType;
  }

  protected createInlineSpread(
    type: IntrospectionInterfaceType | IntrospectionObjectType,
    options: OutputSelectorOptions
  ): OutputSelectorData {
    const { visitedTypes } = options;

    return {
      typeRef: type,
      args: [],
      primitive: false,
      name: `... on ${type.name}`,
      options: {
        ...options,
        addTypeName: true,
        visitedTypes: [...visitedTypes]
      }
    };
  }

  private addTypeNameField(
    options: OutputSelectorOptions,
    nodes: OutputSelectorData[]
  ): OutputSelectorData[] {
    return [
      {
        options,
        name: '__typename',
        typeRef: { kind: 'SCALAR', name: 'String' },
        args: [],
        primitive: true
      },
      ...nodes
    ];
  }
}
