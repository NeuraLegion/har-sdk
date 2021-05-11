declare module 'jstoxml' {
  export function toXML(
    obj: Record<string, any> = {},
    config: Record<string, any> = {}
  ): string;
}
