export interface SyntaxErrorDetails {
  readonly message: string;
  readonly offset?: number;
  readonly sample?: string;
}
