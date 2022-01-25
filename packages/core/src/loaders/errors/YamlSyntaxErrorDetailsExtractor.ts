import { BaseSyntaxErrorDetailsExtractor } from './BaseSyntaxErrorDetailsExtractor';
import { YAMLException } from 'js-yaml';

export class YamlSyntaxErrorDetailsExtractor extends BaseSyntaxErrorDetailsExtractor<YAMLException> {
  private readonly LOCATION_PATTERN = /\((\d+):(\d+)\)$/;

  protected extractMessage(error: YAMLException): string {
    const [mainMessage]: string[] = error.message.split('\n');

    return mainMessage
      .replace(/^YAMLException: /, '')
      .replace(this.LOCATION_PATTERN, '')
      .trim();
  }

  protected extractOffset(error: YAMLException): number | undefined {
    const [mainMessage]: string[] = error.message.split('\n');
    const matchRes = mainMessage.match(this.LOCATION_PATTERN);

    return matchRes
      ? this.calculateOffset(+matchRes[1], +matchRes[2])
      : undefined;
  }

  protected extractSnippet(error: YAMLException): string {
    return error.message.split('\n').slice(2).join('\n');
  }
}
