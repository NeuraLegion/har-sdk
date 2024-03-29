import {
  type OutputSelectorData,
  type OutputSelectorOptions
} from './OutputSelector';
import { AbstractSelector } from './AbstractSelector';
import {
  type IntrospectionInterfaceType,
  type IntrospectionObjectType,
  type IntrospectionSchema,
  type IntrospectionUnionType
} from '@har-sdk/core';

export class UnionSelector extends AbstractSelector<IntrospectionUnionType> {
  constructor() {
    super('UNION');
  }

  protected buildFields(
    type: IntrospectionUnionType,
    options: OutputSelectorOptions
  ): OutputSelectorData[] {
    const { schema } = options;

    return this.findPossibleTypes(schema, type).map(
      (
        possibleType: IntrospectionInterfaceType | IntrospectionObjectType
      ): OutputSelectorData => this.createInlineSpread(possibleType, options)
    );
  }

  private findPossibleTypes(
    schema: IntrospectionSchema,
    unionType: IntrospectionUnionType
  ) {
    return schema.types.filter(
      (introspectionType): introspectionType is IntrospectionObjectType =>
        introspectionType.kind === 'OBJECT' &&
        unionType.possibleTypes.some(
          (possibleType) => possibleType.name === introspectionType.name
        )
    );
  }
}
