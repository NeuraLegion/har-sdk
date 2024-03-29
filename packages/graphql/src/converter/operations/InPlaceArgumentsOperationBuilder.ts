import { BaseOperationBuilder } from './BaseOperationBuilder';
import { type InputSamplers, InputSamplerOptions } from '../input-samplers';
import { type OperationBuilderOptions } from './OperationBuilder';
import { type Operation } from './Operations';
import {
  type IntrospectionInputValue,
  type IntrospectionSchema
} from '@har-sdk/core';

export class InPlaceArgumentsOperationBuilder extends BaseOperationBuilder {
  private isFileUploadOperation = false;

  constructor(schema: IntrospectionSchema, inputSamplers: InputSamplers) {
    super(schema, inputSamplers);
  }

  protected buildOperation(
    body: string,
    { operationType }: OperationBuilderOptions
  ): Operation | undefined {
    return this.isFileUploadOperation
      ? undefined
      : {
          query: `${operationType} ${body}`
        };
  }

  protected transform(args: readonly IntrospectionInputValue[]): string {
    const options: InputSamplerOptions = {
      schema: this.schema,
      inputSamplers: this.inputSamplers,
      visitedTypes: [],
      files: [],
      pointer: []
    };

    const argList = args
      .map((arg) => {
        const sample = this.createSample(arg, options);

        this.isFileUploadOperation =
          this.isFileUploadOperation || options.files.length > 0;

        return sample ? `${arg.name}: ${sample}` : sample;
      })
      .filter((field): field is string => !!field);

    return argList.length ? `(${argList})` : '';
  }
}
