import { SpecTreeNode, SpecTreeNodeData } from './SpecTreeNode';
import { SpecTreeNodeParam } from './SpecTreeNodeParam';

export interface SpecTreeParamNodeData extends SpecTreeNodeData {
  parameters: SpecTreeNodeParam[];
}

export class SpecTreeParamNode extends SpecTreeNode {
  private _parameters?: SpecTreeNodeParam[];

  get parameters(): ReadonlyArray<SpecTreeNodeParam> {
    return this._parameters;
  }

  constructor({ parameters, ...data }: SpecTreeParamNodeData) {
    super(data);
    this._parameters = parameters;
  }

  public deleteParam(pointer: string): void {
    const param = this.parameters.find((p) => p.pointer === pointer);

    if (!param) {
      throw new Error("The parameter doesn't exist.");
    }

    this._parameters.splice(this.parameters.indexOf(param), 1);
  }
}
