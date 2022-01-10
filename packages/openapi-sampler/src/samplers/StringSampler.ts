import { Sampler, OpenAPISchema } from './Sampler';
import RandExp from 'randexp';

export class StringSampler implements Sampler {
  public sample(schema: OpenAPISchema): any {
    const format = schema.pattern ? 'pattern' : schema.format || 'default';
    const sampler = stringFormats[format] || defaultSample;

    return sampler(schema.minLength || 0, schema.maxLength, schema.pattern);
  }
}

const checkLength = (
  value: string,
  format: string,
  min: number,
  max: number
) => {
  if (min && value.length < min) {
    throw new Error(
      `Using minLength = ${min} is incorrect with format "${format}"`
    );
  }

  if (max && value.length > max) {
    throw new Error(
      `Using maxLength = ${max} is incorrect with format "${format}"`
    );
  }

  return value;
};

const adjustLength = (sample: string, min: number, max: number): string => {
  const minLength = min ? min : 0;
  const maxLength = max ? max : sample.length;

  return minLength > sample.length
    ? sample
        .repeat(Math.trunc(minLength / sample.length) + 1)
        .substring(0, minLength)
    : sample.substr(0, Math.min(Math.max(sample.length, minLength), maxLength));
};

const defaultSample = (min: number, max: number) =>
  adjustLength('lorem', min, max);

const patternSample = (min: number, max: number, pattern: string | RegExp) => {
  const randExp = new RandExp(pattern);
  randExp.randInt = (a, b) => Math.floor((a + b) / 2);

  return checkLength(randExp.gen(), 'pattern', min, max);
};

const base64sample = () => 'ZHVtbXkgYmluYXJ5IHNhbXBsZQA=';

const stringFormats = {
  'email': () => 'jon.snow@targaryen.com',
  'password': (min: number, max: number) => adjustLength('p@$$w0rd', min, max),
  'date-time': (min: number, max: number) =>
    checkLength('2021-12-31T23:34:00Z', 'date-time', min, max),
  'date': (min: number, max: number) =>
    checkLength('2021-12-31', 'date', min, max),
  'ipv4': () => '208.67.222.222',
  'ipv6': () => '0000:0000:0000:0000:0000:ffff:d043:dcdc',
  'hostname': () => 'brokencrystals.com',
  'uri': () => 'https://github.com/NeuraLegion/brokencrystals',
  'byte': base64sample,
  'binary': () => '\\x01\\x02\\x03\\x04\\x05',
  'base64': base64sample,
  'uuid': () => 'fbdf5a53-161e-4460-98ad-0e39408d8689',
  'pattern': patternSample,
  'default': defaultSample
};
