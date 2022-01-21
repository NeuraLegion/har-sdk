export type ErrorPosition =
  | {
      lineNumber: number;
      columnNumber: number;
    }
  // 0-based offset
  | number;
