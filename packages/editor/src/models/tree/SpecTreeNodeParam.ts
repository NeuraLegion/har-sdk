export interface SpecTreeNodeParam {
  readonly paramType: 'location' | 'requestBody' | 'variable';
  readonly value?: any;
  readonly valueJsonPointer: string;
}
