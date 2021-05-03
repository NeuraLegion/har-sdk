import { ensureLength, toRFCDateTime } from '../utils';
import { OpenAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';
import faker from 'faker';
import randexp from 'randexp';

export class StringSampler extends Sampler {
  public sample(schema: OpenAPISampler.Schema): any {
    const format = schema.pattern ? 'pattern' : schema.format || 'default';
    const sampler = stringFormats[format] || defaultSample;

    return sampler(schema.minLength || 0, schema.maxLength, schema.pattern);
  }
}

function emailSample() {
  return faker.internet.email().toLowerCase();
}

function passwordSample(min: number, max: number) {
  return ensureLength(faker.internet.password(), min, max);
}

function commonDateTimeSample(min: number, max: number, omitTime?: boolean) {
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
}

function dateTimeSample(min: number, max: number) {
  return commonDateTimeSample(min, max);
}

function dateSample(min: number, max: number) {
  return commonDateTimeSample(min, max, true);
}

function defaultSample(min: number, max: number) {
  return ensureLength(faker.lorem.word(), min, max);
}

function ipv4Sample() {
  return faker.internet.ip();
}

function ipv6Sample() {
  return faker.internet.ipv6();
}

function hostnameSample() {
  return faker.internet.domainName();
}

function uriSample() {
  return faker.internet.url();
}

function binarySample() {
  return toBase64(faker.random.words(3));
}

function uuidSample() {
  return faker.random.uuid();
}

function toBase64(data: any) {
  return Buffer.from(data).toString('base64');
}

function patternSample(min: number, max: number, pattern: string | RegExp) {
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
}

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
