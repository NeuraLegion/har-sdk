import {
  type OutputSelectorData,
  type OutputSelectorOptions
} from './OutputSelector';
import { AbstractSelector } from './AbstractSelector';
import {
  type IntrospectionInterfaceType,
  type IntrospectionObjectType,
  type IntrospectionSchema
} from '@har-sdk/core';

export class InterfaceSelector extends AbstractSelector<IntrospectionInterfaceType> {
  constructor() {
    super('INTERFACE');
  }

  protected override buildFields(
    type: IntrospectionInterfaceType,
    options: OutputSelectorOptions
  ): OutputSelectorData[] {
    return [
      ...this.selectOwnFields(type, options),
      ...this.selectSpreads(type, {
        ...options,
        excludeFields: type.fields.map((field) => field.name)
      })
    ];
  }

  private selectSpreads(
    type: IntrospectionInterfaceType,
    options: OutputSelectorOptions
  ): OutputSelectorData[] {
    const { schema } = options;

    return this.findDescendantTypes(schema, type).map(
      (
        descendantType: IntrospectionInterfaceType | IntrospectionObjectType
      ): OutputSelectorData => this.createInlineSpread(descendantType, options)
    );
  }

  private findDescendantTypes(
    schema: IntrospectionSchema,
    type: IntrospectionInterfaceType
  ) {
    return schema.types.filter(
      (
        introspectionType
      ): introspectionType is
        | IntrospectionInterfaceType
        | IntrospectionObjectType =>
        (introspectionType.kind === 'INTERFACE' ||
          introspectionType.kind === 'OBJECT') &&
        introspectionType.interfaces.some(
          (interfaceType) => interfaceType.name === type.name
        )
    );
  }
}
