export class WordingHelper {
  public static getComparison(keyword: string): string {
    return keyword.startsWith('min') ? 'more' : 'fewer';
  }

  public static humanizeList(arr: string[], conjunction = 'and'): string {
    if (arr.length === 0) {
      return 'nothing';
    }
    if (arr.length === 1) {
      return arr[0];
    }
    if (arr.length === 2) {
      return `${arr[0]} ${conjunction} ${arr[1]}`;
    }

    return `${arr.slice(0, -1).join(', ')}, ${conjunction} ${
      arr[arr.length - 1]
    }`;
  }
}
