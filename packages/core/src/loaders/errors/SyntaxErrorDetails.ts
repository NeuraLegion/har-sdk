export interface SyntaxErrorDetails {
  readonly message: string;
  readonly offset?: number;
  readonly snippet?: string;
}
