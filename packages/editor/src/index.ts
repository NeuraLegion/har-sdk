import { SourceType, SpecTreeNode } from './parser';
import { ok } from 'assert';

export const spec2Tree = async (
  source: string,
  type: SourceType
): Promise<SpecTreeNode> => {
  ok(source, `Please provide a valid Postman Collection.`);

  // TODO: parse
};

export const tree2Spec = async (
  tree: SpecTreeNode,
  type: SourceType
): Promise<string> => {
  ok(source, `Please provide a valid Postman Collection.`);

  // TODO: stringify
};
