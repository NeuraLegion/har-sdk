import template from 'url-template';

export class UriTemplator {
  public substitute(templateStr: string, values: Record<string, any>): string {
    return template.parse(templateStr).expand(values);
  }
}
