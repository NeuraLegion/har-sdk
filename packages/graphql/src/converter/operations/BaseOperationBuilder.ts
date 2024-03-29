import { type OutputSelectorTreeNode } from '../output-selectors';
import {
  type OperationBuilder,
  type OperationBuilderOptions
} from './OperationBuilder';
import { type Operation } from './Operations';
import {
  type InputSamplers,
  type InputSamplerOptions
} from '../input-samplers';
import {
  type IntrospectionInputValue,
  type IntrospectionSchema
} from '@har-sdk/core';

export abstract class BaseOperationBuilder implements OperationBuilder {
  protected constructor(
    protected readonly schema: IntrospectionSchema,
    protected readonly inputSamplers: InputSamplers
  ) {}

  protected abstract buildOperation(
    body: string,
    options: OperationBuilderOptions
  ): Operation | undefined;

  protected abstract transform(
    args: readonly IntrospectionInputValue[]
  ): string;

  public build(options: OperationBuilderOptions): Operation | undefined {
    const { selectorRoot } = options;
    const body = `{ ${this.merge(selectorRoot)} }`;

    return this.buildOperation(body, options);
  }

  protected merge(node: OutputSelectorTreeNode): string {
    const args = this.transform(node.value.args);

    if (node.value.primitive) {
      return `${node.value.name}${args}`;
    }

    const childSelections = node.children
      .map((child) => this.merge(child))
      .filter((fields) => !!fields)
      .join(' ');

    return childSelections
      ? `${node.value.name}${args} { ${childSelections} }`
      : '';
  }

  protected createSample(
    arg: IntrospectionInputValue,
    options: InputSamplerOptions
  ) {
    if (arg.defaultValue !== undefined && arg.defaultValue !== null) {
      return arg.defaultValue;
    }

    return this.inputSamplers.find(arg.type)?.sample(arg.type, {
      ...options,
      pointer: [...options.pointer, arg.name]
    });
  }
}
