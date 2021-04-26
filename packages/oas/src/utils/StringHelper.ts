export class StringHelper {
  public static removeTrailingSlash(x: string): string {
    return x.replace(/\/$/, '');
  }

  public static removeLeadingSlash(x: string): string {
    return x.replace(/^\//, '');
  }
}
