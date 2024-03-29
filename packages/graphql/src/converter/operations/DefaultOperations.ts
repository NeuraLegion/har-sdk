import { ConverterConstants } from '../ConverterConstants';
import { ConverterOptions } from '../ConverterOptions';
import { type Operation } from './Operations';
import {
  OutputSelectors,
  type OutputSelectorTreeNode
} from '../output-selectors';
import {
  OperationBuilderFactory,
  OperationComposition
} from './OperationBuilderFactory';
import {
  type IntrospectionField,
  type IntrospectionObjectType,
  IntrospectionQuery,
  type IntrospectionSchema,
  type IntrospectionType
} from '@har-sdk/core';

interface GraphQLComposedOperationData {
  composition: OperationComposition;
  selectorRoot: OutputSelectorTreeNode;
  operation?: Operation;
}

export class DefaultOperations {
  constructor(
    private readonly outputSelectors: OutputSelectors = new OutputSelectors(),
    private readonly operationBuilderFactory: OperationBuilderFactory = new OperationBuilderFactory()
  ) {}

  public create(
    introspection: IntrospectionQuery,
    options: ConverterOptions = {}
  ): Operation[] {
    const { __schema: schema } = introspection;

    const {
      limit = ConverterConstants.MAX_OPERATIONS_OUTPUT,
      operationCostThreshold = ConverterConstants.OPERATION_COST_THRESHOLD,
      includeSimilarOperations
    } = options;

    let count = 0;

    return this.findOperations(schema)
      .flatMap((operation) =>
        [...operation.fields].flatMap((field: IntrospectionField) => {
          let ops =
            count > limit
              ? []
              : this.buildOperations(
                  {
                    schema,
                    field,
                    operationType: operation.name.toLowerCase()
                  },
                  {
                    ...options,
                    operationCostThreshold
                  }
                );

          ops = includeSimilarOperations
            ? ops
            : this.omitSimilarOperations(ops);

          count += ops.length;

          return ops;
        })
      )
      .map((op) => op.operation)
      .slice(0, limit);
  }

  private buildOperations(
    {
      schema,
      operationType,
      field
    }: {
      schema: IntrospectionSchema;
      operationType: string;
      field: IntrospectionField;
    },
    options: ConverterOptions
  ): Required<GraphQLComposedOperationData>[] {
    const { skipInPlaceValues, skipExternalizedVariables, skipFileUploads } =
      options;

    const selectorRoots = this.outputSelectors.create(
      { schema, field },
      options
    );

    const compositions = [
      ...(skipInPlaceValues ? [] : [OperationComposition.IN_PLACE_ARGUMENTS]),
      ...(skipExternalizedVariables && skipFileUploads
        ? []
        : [OperationComposition.EXTERNALIZED_VARIABLES])
    ];

    return compositions.flatMap((composition) =>
      selectorRoots
        .map((selectorRoot) => ({
          composition,
          selectorRoot,
          operation: this.operationBuilderFactory
            .create(composition, schema)
            .build({
              selectorRoot,
              operationType,
              operationName: field.name
            })
        }))
        .filter(
          (
            op: GraphQLComposedOperationData
          ): op is Required<GraphQLComposedOperationData> => !!op.operation
        )
        .filter((op) => this.shouldIncludeOperation(op, options))
    );
  }

  private shouldIncludeOperation(
    op: GraphQLComposedOperationData,
    options: ConverterOptions
  ): boolean {
    const { skipExternalizedVariables, skipFileUploads, skipInPlaceValues } =
      options;
    const isUpload = !!op.operation?.files?.length;
    const isInPlaceComposition =
      op.composition === OperationComposition.IN_PLACE_ARGUMENTS;
    const isExternalizedComposition =
      op.composition === OperationComposition.EXTERNALIZED_VARIABLES;

    const includeInPlaceValues =
      !isUpload && !skipInPlaceValues && isInPlaceComposition;
    const includeExternalizedVariables =
      !isUpload && !skipExternalizedVariables && isExternalizedComposition;
    const includeFileUploads =
      isUpload && !skipFileUploads && isExternalizedComposition;

    return (
      includeInPlaceValues || includeExternalizedVariables || includeFileUploads
    );
  }

  private omitSimilarOperations(
    operations: Required<GraphQLComposedOperationData>[]
  ) {
    const inPlaceArguments = operations.filter(
      (op) => op.composition === OperationComposition.IN_PLACE_ARGUMENTS
    );

    const removables = operations.filter(
      (op) =>
        op.composition === OperationComposition.EXTERNALIZED_VARIABLES &&
        !op.operation.variables &&
        inPlaceArguments.some(
          (inPlace) => inPlace.selectorRoot === op.selectorRoot
        )
    );

    return operations.filter((op) => !removables.includes(op));
  }

  private findOperations(
    schema: IntrospectionSchema
  ): IntrospectionObjectType[] {
    const operationNames = this.getOperationNames(schema);

    return schema.types
      .filter(
        (x: IntrospectionType): x is IntrospectionObjectType =>
          x.kind === 'OBJECT'
      )
      .filter((x) => x.name && operationNames.includes(x.name));
  }

  private getOperationNames(schema: IntrospectionSchema) {
    const { mutationType, queryType, subscriptionType } = schema;
    const operationNames: string[] = [
      queryType.name,
      ...(mutationType?.name ? [mutationType.name] : []),
      ...(subscriptionType?.name ? [subscriptionType.name] : [])
    ];

    return operationNames;
  }
}
