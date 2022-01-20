import { BaseSyntaxErrorDetailsExtractor } from './BaseSyntaxErrorDetailsExtractor';
import { YAMLException } from 'js-yaml';

export class YamlSyntaxErrorDetailsExtractor extends BaseSyntaxErrorDetailsExtractor<YAMLException> {
  private readonly LOCATION_PATTERN = /\((\d+):(\d+)\)$/;

  protected extractMessage(error: YAMLException): string {
    return error.message;
  }

  protected extractOffset(error: YAMLException): number | undefined {
    const matchRes = error.message.split('\n')[0].match(this.LOCATION_PATTERN);

    return matchRes
      ? this.calculateOffset(+matchRes[1], +matchRes[2])
      : undefined;
  }

  protected extractSample(error: YAMLException): string {
    return error.message.split('\n').slice(2).join('\n');
  }
}
