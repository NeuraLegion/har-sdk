export class WordingHelper {
  public static getComparison(keyword: string): string {
    return keyword.startsWith('min') ? 'more' : 'fewer';
  }
}
