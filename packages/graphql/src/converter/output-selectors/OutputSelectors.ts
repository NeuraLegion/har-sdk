import { ConverterOptions } from '../ConverterOptions';
import { OutputSelector, type OutputSelectorData } from './OutputSelector';
import { GraphQlTypeRef } from '../GraphQlTypeRef';
import { isGraphQLPrimitive } from '../../utils';
import { OperationCostAnalyzer } from '../operations/OperationCostAnalyzer';
import { InterfaceSelector } from './InterfaceSelector';
import { ObjectSelector } from './ObjectSelector';
import { UnionSelector } from './UnionSelector';
import { PrimitiveSelector } from './PrimitiveSelector';
import {
  type IntrospectionField,
  type IntrospectionNamedTypeRef,
  type IntrospectionOutputType,
  type IntrospectionSchema
} from '@har-sdk/core';
import { createHash } from 'crypto';

export interface OutputSelectorTreeNode {
  value: OutputSelectorData;
  children: OutputSelectorTreeNode[];
  parent?: OutputSelectorTreeNode;
}

export class OutputSelectors {
  constructor(
    private readonly outputSelectors: OutputSelector<IntrospectionOutputType>[] = [
      new InterfaceSelector(),
      new ObjectSelector(),
      new UnionSelector(),
      new PrimitiveSelector()
    ]
  ) {}

  public create(
    {
      schema,
      field
    }: {
      schema: IntrospectionSchema;
      field: IntrospectionField;
    },
    options: ConverterOptions
  ): OutputSelectorTreeNode[] {
    const { typeRef: resolvedTypeRef } = new GraphQlTypeRef(field.type);

    const root: OutputSelectorData = {
      name: field.name,
      primitive: isGraphQLPrimitive(resolvedTypeRef),
      typeRef: resolvedTypeRef,
      args: field.args,
      options: { schema, visitedTypes: [] }
    };

    const selections = [
      this.expandSelectionsInBreadth(
        {
          value: root,
          children: []
        },
        new OperationCostAnalyzer(options)
      ),
      this.expandSelectionsInDepth(
        {
          value: root,
          children: []
        },
        new OperationCostAnalyzer(options)
      )
    ]
      .filter(
        (selectionRoot): selectionRoot is OutputSelectorTreeNode =>
          !!selectionRoot
      )
      .map((selectionRoot): [string, OutputSelectorTreeNode] => [
        this.createDigest(selectionRoot),
        selectionRoot
      ]);

    return [...new Map<string, OutputSelectorTreeNode>(selections).values()];
  }

  private expandSelectionsInDepth(
    root: OutputSelectorTreeNode,
    analyzer: OperationCostAnalyzer
  ) {
    const stack: OutputSelectorTreeNode[] = [root];

    analyzer.estimate(root);

    while (stack.length) {
      const cursor = stack.pop();

      if (!cursor || analyzer.done) {
        break;
      }

      this.expandNode(cursor, analyzer);

      stack.push(...cursor.children);
    }

    return this.omitInvalidSubtrees(root);
  }

  private expandSelectionsInBreadth(
    root: OutputSelectorTreeNode,
    analyzer: OperationCostAnalyzer
  ) {
    const queue: OutputSelectorTreeNode[] = [root];

    analyzer.estimate(root);

    while (queue.length) {
      const cursor = queue.shift();

      if (!cursor || analyzer.done) {
        break;
      }

      this.expandNode(cursor, analyzer);

      queue.push(...cursor.children);
    }

    return this.omitInvalidSubtrees(root);
  }

  private expandNode(
    node: OutputSelectorTreeNode,
    analyzer: OperationCostAnalyzer
  ) {
    const selector = this.find(node.value.typeRef);
    if (selector) {
      const selectors = selector.select(node.value.typeRef, node.value.options);

      const children = selectors.map((value) =>
        analyzer.estimate({
          value,
          parent: node,
          children: []
        })
      );

      node.children = children
        .map((child) => (analyzer.analyze(child) ? child : undefined))
        .filter((child): child is OutputSelectorTreeNode => !!child);
    }
  }

  private omitInvalidSubtrees(
    node: OutputSelectorTreeNode
  ): OutputSelectorTreeNode | undefined {
    if (this.isValidSubtree(node)) {
      node.children = node.children
        .map((child) => this.omitInvalidSubtrees(child))
        .filter((child): child is OutputSelectorTreeNode => !!child);

      return node;
    }

    return undefined;
  }

  private isValidSubtree(node: OutputSelectorTreeNode): boolean {
    return (
      node.value.primitive || node.children.some((n) => this.isValidSubtree(n))
    );
  }

  private createDigest(root: OutputSelectorTreeNode): string {
    const hash = createHash('sha256');
    const stack: OutputSelectorTreeNode[] = [root];

    while (stack.length) {
      const cursor = stack.pop();

      if (!cursor) {
        break;
      }

      hash.update(cursor.value.name);

      stack.push(...cursor.children);
    }

    return hash.digest('hex');
  }

  private find(
    typeRef: IntrospectionNamedTypeRef<IntrospectionOutputType>
  ): OutputSelector<IntrospectionOutputType> | undefined {
    return this.outputSelectors.find((s) => s.supportsType(typeRef));
  }
}
