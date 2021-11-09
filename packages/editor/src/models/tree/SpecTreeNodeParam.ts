export interface SpecTreeNodeParam {
  readonly paramType: 'location' | 'requestBody' | 'variable';
  readonly valueJsonPointer: string;
  readonly value?: any;
}
