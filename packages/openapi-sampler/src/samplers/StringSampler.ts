import { Sampler, OpenAPISchema } from './Sampler';
import RandExp from 'randexp';

export class StringSampler implements Sampler {
  private readonly stringFormats = {
    'email': () => 'jon.snow@targaryen.com',
    'password': (min: number, max: number) =>
      this.adjustLength('p@$$w0rd', min, max),
    'date-time': () => '2021-12-31T23:34:00Z',
    'date': () => '2021-12-31',
    'ipv4': () => '208.67.222.222',
    'ipv6': () => '0000:0000:0000:0000:0000:ffff:d043:dcdc',
    'hostname': () => 'brokencrystals.com',
    'uri': () => 'https://github.com/NeuraLegion/brokencrystals',
    'byte': () => 'ZHVtbXkgYmluYXJ5IHNhbXBsZQA=',
    'binary': () => '\\x01\\x02\\x03\\x04\\x05',
    'base64': () => 'ZHVtbXkgYmluYXJ5IHNhbXBsZQA=',
    'uuid': () => 'fbdf5a53-161e-4460-98ad-0e39408d8689',
    'pattern': (
      _min: number,
      _max: number,
      { pattern }: { pattern: string | RegExp }
    ) => this.patternSample(pattern),
    'default': (min: number, max: number) =>
      this.adjustLength('lorem', min, max)
  };

  public sample(schema: OpenAPISchema): any {
    const format = schema.pattern ? 'pattern' : schema.format || 'default';
    const sampler = this.stringFormats[format] || this.stringFormats['default'];

    const { minLength: min, maxLength: max } = schema;

    return this.checkLength(sampler(min || 0, max, schema), format, min, max);
  }

  private patternSample(pattern: string | RegExp): string {
    const randExp = new RandExp(pattern);
    randExp.randInt = (a, b) => Math.floor((a + b) / 2);

    return randExp.gen();
  }

  private checkLength(
    value: string,
    format: string,
    min: number,
    max: number
  ): string {
    if ((min && value.length < min) || (max && value.length > max)) {
      const pairs = [
        { key: 'minLength', value: min },
        { key: 'maxLength', value: max },
        { key: 'format', value: format }
      ];

      const boundariesStr = pairs
        .filter((p) => p.value !== undefined)
        .map((p) => `${p.key}=${p.value}`)
        .join(', ');

      throw new Error(`Cannot sample string by boundaries: ${boundariesStr}`);
    }

    return value;
  }

  private adjustLength(sample: string, min: number, max: number): string {
    const minLength = min ? min : 0;
    const maxLength = max ? max : sample.length;

    return minLength > sample.length
      ? sample
          .repeat(Math.trunc(minLength / sample.length) + 1)
          .substring(0, minLength)
      : sample.substr(
          0,
          Math.min(Math.max(sample.length, minLength), maxLength)
        );
  }
}
