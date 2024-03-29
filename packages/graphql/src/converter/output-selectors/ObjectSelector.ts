import {
  type OutputSelectorData,
  type OutputSelectorOptions
} from './OutputSelector';
import { AbstractSelector } from './AbstractSelector';
import { type IntrospectionObjectType } from '@har-sdk/core';

export class ObjectSelector extends AbstractSelector<IntrospectionObjectType> {
  constructor() {
    super('OBJECT');
  }

  protected override buildFields(
    type: IntrospectionObjectType,
    options: OutputSelectorOptions
  ): OutputSelectorData[] {
    return this.selectOwnFields(type, options);
  }
}
