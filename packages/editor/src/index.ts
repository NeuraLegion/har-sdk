import { SourceType, SpecTreeNode } from './parser';
import { ok } from 'assert';

export const spec2Tree = async (
  source: string,
  type: SourceType
): Promise<SpecTreeNode> => {
  ok(source, `Please provide a valid collection.`);
  ok(type, `Please provide a valid source type.`);
  // TODO: parse

  return Promise.resolve(null);
};

export const tree2Spec = async (
  tree: SpecTreeNode,
  type: SourceType
): Promise<string> => {
  ok(tree, `Please provide a valid tree.`);
  ok(type, `Please provide a valid source type.`);
  // TODO: stringify

  return Promise.resolve('');
};
