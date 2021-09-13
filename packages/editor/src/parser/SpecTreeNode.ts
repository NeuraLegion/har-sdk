export interface SpecTreeNodeData {
  pointer: string;
  name: string;
  children?: SpecTreeNode[];
  code?: string;
}

export class SpecTreeNode {
  public readonly pointer: string;
  public readonly name: string;
  public readonly code?: string;

  private _children?: SpecTreeNode[];

  get children(): ReadonlyArray<SpecTreeNode> {
    return this._children;
  }

  set children(children: ReadonlyArray<SpecTreeNode>) {
    this._children = children.map((child) => child);
  }

  constructor({ pointer, name, children, code }: SpecTreeNodeData) {
    this.name = name;
    this.pointer = pointer;
    this.code = code;
    // TODO: should be implemented in the parser
    this._children = children;
  }

  public deleteChild(pointer: string): void {
    const child = this.children.find((c) => c.pointer === pointer);

    if (!child) {
      throw new Error("The child doesn't exist.");
    }

    this._children.splice(this._children.indexOf(child), 1);
  }
}
