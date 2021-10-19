export interface Parser<T> {
  parse(pointer: string): T;
}
