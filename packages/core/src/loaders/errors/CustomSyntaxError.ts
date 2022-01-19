export class CustomSyntaxError extends Error {
  constructor(
    message: string,
    public readonly offset?: number,
    public readonly sample?: string
  ) {
    super(message);
  }
}
