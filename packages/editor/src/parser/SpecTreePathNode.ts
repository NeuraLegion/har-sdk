import { HttpMethod } from './HttpMethod';
import { SpecTreeParamNode, SpecTreeParamNodeData } from './SpecTreeParamNode';

export interface SpecTreePathNodeData extends SpecTreeParamNodeData {
  path: string;
  method: HttpMethod;
}

export class SpecTreePathNode extends SpecTreeParamNode {
  public readonly path: string;
  public readonly method: HttpMethod;

  constructor({ path, method, ...data }: SpecTreePathNodeData) {
    super(data);
    this.path = path;
    this.method = method;
  }
}
