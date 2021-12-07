export class WordingHelper {
  public static humanizeComparison(keyword: string): string {
    return keyword.startsWith('min') ? 'more' : 'less';
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

  public static humanizeTarget(jsonPointer: string): string {
    const { name, index } = WordingHelper.extractTarget(jsonPointer);

    return index !== null
      ? `The element at index ${index} in the array \`${name}\``
      : `The property \`${name}\``;
  }

  private static extractTarget(jsonPointer: string): {
    name: string;
    index: number | null;
  } {
    // eslint-disable-next-line @typescript-eslint/typedef,@typescript-eslint/naming-convention
    const [_, name, index] = /([^/]+)(?:\/(\d+))?$/g.exec(jsonPointer) || [];

    if (!index) {
      return { name, index: null };
    }

    return +index < 100
      ? { name, index: +index }
      : { name: index, index: null };
  }
}
