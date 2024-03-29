import { type OperationBuilderOptions } from './OperationBuilder';
import { GraphQlTypeRef } from '../GraphQlTypeRef';
import { graphQLParseValue } from '../../utils';
import { BaseOperationBuilder } from './BaseOperationBuilder';
import { type Operation } from './Operations';
import {
  type InputSamplerOptions,
  type InputSamplers
} from '../input-samplers';
import {
  type IntrospectionInputValue,
  type IntrospectionSchema
} from '@har-sdk/core';

export class ExternalizedVariablesOperationBuilder extends BaseOperationBuilder {
  private variables = new Map<string, IntrospectionInputValue>();

  constructor(schema: IntrospectionSchema, inputSamplers: InputSamplers) {
    super(schema, inputSamplers);
  }

  protected buildOperation(
    body: string,
    { operationType, operationName }: OperationBuilderOptions
  ): Operation | undefined {
    const inputArgs = this.buildInputArgs();

    const wrappingOperationName =
      this.createWrappingOperationName(operationName);

    const samplerOptions: InputSamplerOptions = {
      schema: this.schema,
      inputSamplers: this.inputSamplers,
      visitedTypes: [],
      pointer: ['variables'],
      files: []
    };

    const variables = this.buildVariables(samplerOptions);

    return {
      operationName: wrappingOperationName,
      query: `${operationType} ${wrappingOperationName}${inputArgs} ${body}`,
      ...(variables ? { variables } : {}),
      ...(samplerOptions.files.length > 0
        ? { files: samplerOptions.files }
        : {})
    };
  }

  protected transform(args: readonly IntrospectionInputValue[]): string {
    const argList = args.map(
      (arg) => `${arg.name}: $${this.getOrCreateVariable(arg)}`
    );

    return argList.length ? `(${argList})` : '';
  }

  private createWrappingOperationName(operationName: string) {
    if (operationName.length > 0) {
      const first = operationName.charAt(0);

      return `${
        first === first.toUpperCase()
          ? first.toLowerCase()
          : first.toUpperCase()
      }${operationName.substring(1)}`;
    }

    return operationName;
  }

  private buildVariables(options: InputSamplerOptions) {
    return this.variables.size === 0
      ? undefined
      : Object.fromEntries(
          [...this.variables.entries()].map(
            ([varName, arg]: [string, IntrospectionInputValue]) => [
              varName,
              this.trySampleValue(arg, options)
            ]
          )
        );
  }

  private buildInputArgs() {
    const input = [...this.variables.entries()]
      .map(
        ([varName, arg]: [string, IntrospectionInputValue]) =>
          `$${varName}: ${new GraphQlTypeRef(arg.type).type}`
      )
      .join(', ');

    return input ? `(${input})` : input;
  }

  private getOrCreateVariable(
    arg: IntrospectionInputValue,
    index: number = 0
  ): string {
    const varName = index === 0 ? arg.name : `${arg.name}${index}`;

    if (this.variables.has(varName)) {
      return this.getOrCreateVariable(arg, 1 + index);
    }

    this.variables.set(varName, arg);

    return varName;
  }

  private trySampleValue(
    arg: IntrospectionInputValue,
    options: InputSamplerOptions
  ): unknown {
    const value = this.createSample(arg, options);

    if (value === undefined) {
      return undefined;
    }

    try {
      return graphQLParseValue(value);
    } catch {
      // noop
    }

    return undefined;
  }
}
