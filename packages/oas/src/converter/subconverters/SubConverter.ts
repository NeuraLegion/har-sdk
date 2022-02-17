export interface SubConverter<R> {
  convert(path: string, method: string): R;
}
