declare module 'jstoxml' {
  export function toXML(
    obj: Record<string, unknown>,
    config?: Record<string, unknown>
  ): string;
}
