import { ConverterConstants } from '../ConverterConstants';
import { type OutputSelectorTreeNode } from '../output-selectors';
import { ConverterOptions } from '../ConverterOptions';

export class OperationCostAnalyzer {
  private readonly maxCostThreshold: number;

  private cost: number = 0;

  get done() {
    return this.cost >= this.maxCostThreshold;
  }

  constructor(options: ConverterOptions) {
    this.maxCostThreshold =
      options.operationCostThreshold ??
      ConverterConstants.OPERATION_COST_THRESHOLD;
  }

  public estimate(node: OutputSelectorTreeNode): OutputSelectorTreeNode {
    node.value.estimatedCost =
      node.value.args.length + (node.value.primitive ? 1 : 0);

    return node;
  }

  public analyze(node: OutputSelectorTreeNode) {
    if (node.value.primitive) {
      this.cost += this.sumEstimatedCostOnce(node);
    }

    return !this.done;
  }

  private sumEstimatedCostOnce(node: OutputSelectorTreeNode) {
    let cost = node.value.estimatedCost ?? 0;

    // ADHOC: prevent adding the same cost on next iteration
    node.value.estimatedCost = undefined;

    if (node.parent) {
      cost += this.sumEstimatedCostOnce(node.parent);
    }

    return cost;
  }
}
