import { type OutputSelectorTreeNode } from '../output-selectors';
import { type Operation } from './Operations';

export interface OperationBuilderOptions {
  readonly selectorRoot: OutputSelectorTreeNode;
  readonly operationName: string;
  readonly operationType: string;
}

export interface OperationBuilder {
  build(options: OperationBuilderOptions): Operation | undefined;
}
