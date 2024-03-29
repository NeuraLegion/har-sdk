export interface ConverterOptions {
  skipInPlaceValues?: boolean;
  skipExternalizedVariables?: boolean;
  skipFileUploads?: boolean;
  includeSimilarOperations?: boolean;
  limit?: number;
  operationCostThreshold?: number;
}
