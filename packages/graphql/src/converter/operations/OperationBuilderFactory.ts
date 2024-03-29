import { type OperationBuilder } from './OperationBuilder';
import { InputSamplers, DefaultInputSamplers } from '../input-samplers';
import { InPlaceArgumentsOperationBuilder } from './InPlaceArgumentsOperationBuilder';
import { ExternalizedVariablesOperationBuilder } from './ExternalizedVariablesOperationBuilder';
import { type IntrospectionSchema } from '@har-sdk/core';

export enum OperationComposition {
  IN_PLACE_ARGUMENTS = 1,
  EXTERNALIZED_VARIABLES = 2
}

export class OperationBuilderFactory {
  constructor(
    private readonly inputSamplers: InputSamplers = new DefaultInputSamplers()
  ) {}

  public create(
    composition: OperationComposition,
    schema: IntrospectionSchema
  ): OperationBuilder {
    switch (composition) {
      case OperationComposition.IN_PLACE_ARGUMENTS:
        return new InPlaceArgumentsOperationBuilder(schema, this.inputSamplers);
      case OperationComposition.EXTERNALIZED_VARIABLES:
        return new ExternalizedVariablesOperationBuilder(
          schema,
          this.inputSamplers
        );
      default:
        throw new Error(`Wrong GraphQL operation composition: ${composition}.`);
    }
  }
}
