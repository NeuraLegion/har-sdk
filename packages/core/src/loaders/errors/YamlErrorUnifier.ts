import { BaseErrorUnifier } from './BaseErrorUnifier';
import { YAMLException } from 'js-yaml';

export class YamlErrorUnifier extends BaseErrorUnifier<YAMLException> {
  private readonly LOCATION_PATTERN = /\((\d+):(\d+)\)$/;

  constructor(source: string) {
    super(source);
  }

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
