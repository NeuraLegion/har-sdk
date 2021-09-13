export type ParamLocation = 'path' | 'query' | 'header' | 'body';

export interface SpecTreeNodeParamData {
  pointer: string;
  name: string;
  value?: string;
  location?: ParamLocation;
  type?: string;
}

export class SpecTreeNodeParam {
  public readonly pointer: string;
  public readonly name: string;
  public readonly location?: ParamLocation;
  public readonly type?: string;

  private _value?: string;
  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }

  constructor({ pointer, name, value, location, type }: SpecTreeNodeParamData) {
    this.pointer = pointer;
    this.name = name;
    this.location = location;
    this._value = value;
    this.type = type;
  }
}
