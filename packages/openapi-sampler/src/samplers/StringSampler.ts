import { ensureLength, toRFCDateTime } from '../utils';
import { Sampler, SamplerSchema } from './Sampler';
import faker from 'faker';
import randexp from 'randexp';

export class StringSampler implements Sampler {
  public sample(schema: SamplerSchema): any {
    const format = schema.pattern ? 'pattern' : schema.format || 'default';
    const sampler = stringFormats[format] || defaultSample;

    return sampler(schema.minLength || 0, schema.maxLength, schema.pattern);
  }
}

const emailSample = () => faker.internet.email().toLowerCase();

const passwordSample = (min: number, max: number) =>
  ensureLength(faker.internet.password(), min, max);

const commonDateTimeSample = (min: number, max: number, omitTime?: boolean) => {
  const res = toRFCDateTime(new Date(), omitTime, false);

  if (res.length < min) {
    throw new Error(
      `Using minLength = ${min} is incorrect with format "date-time"`
    );
  }

  if (max && res.length > max) {
    throw new Error(
      `Using maxLength = ${max} is incorrect with format "date-time"`
    );
  }

  return res;
};

const dateTimeSample = (min: number, max: number) =>
  commonDateTimeSample(min, max);

const dateSample = (min: number, max: number) =>
  commonDateTimeSample(min, max, true);

const defaultSample = (min: number, max: number) =>
  ensureLength(faker.lorem.word(), min, max);

const ipv4Sample = () => faker.internet.ip();

const ipv6Sample = () => faker.internet.ipv6();

const hostnameSample = () => faker.internet.domainName();

const uriSample = () => faker.internet.url();

const binarySample = () => toBase64(faker.random.words(3));

const uuidSample = () => faker.random.uuid();

const toBase64 = (data: any) => Buffer.from(data).toString('base64');

const patternSample = (min: number, max: number, pattern: string | RegExp) => {
  const res = new randexp(pattern).gen();

  if (res.length < min) {
    throw new Error(
      `Using minLength = ${min} is incorrect with pattern ${pattern}`
    );
  }

  if (max && res.length > max) {
    throw new Error(
      `Using maxLength = ${max} is incorrect with pattern ${pattern}`
    );
  }

  return res;
};

const stringFormats = {
  'email': emailSample,
  'password': passwordSample,
  'date-time': dateTimeSample,
  'date': dateSample,
  'ipv4': ipv4Sample,
  'ipv6': ipv6Sample,
  'hostname': hostnameSample,
  'uri': uriSample,
  'byte': binarySample,
  'binary': binarySample,
  'base64': binarySample,
  'uuid': uuidSample,
  'pattern': patternSample,
  'default': defaultSample
};
