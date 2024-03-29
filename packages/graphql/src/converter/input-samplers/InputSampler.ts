import { type InputSamplers } from './InputSamplers';
import { type OperationFile } from '../operations/Operations';
import {
  type IntrospectionInputTypeRef,
  type IntrospectionSchema
} from '@har-sdk/core';

export interface InputSamplerOptions {
  readonly inputSamplers: InputSamplers;
  readonly schema: IntrospectionSchema;
  readonly visitedTypes: string[];
  readonly pointer: string[];
  readonly files: OperationFile[];
}

export interface InputSampler {
  supportsType(typeRef: IntrospectionInputTypeRef): boolean;

  sample(
    typeRef: IntrospectionInputTypeRef,
    options: InputSamplerOptions
  ): string | undefined;
}
