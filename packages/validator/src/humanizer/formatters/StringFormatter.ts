import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

const formatLabelsMap = {
  'date-time': 'date and time',
  'time': 'time',
  'date': 'date',
  'duration': 'duration',
  'email': 'email address',
  'idn-email': 'internationalized email address',
  'hostname': 'host name',
  'idn-hostname': 'internationalized host name',
  'ipv4': 'IPv4 address',
  'ipv6': 'IPv6 address',
  'uuid': 'unique identifier',
  'uri': 'URI',
  'uri-reference': 'URI reference',
  'iri': 'internationalized URI',
  'iri-reference': 'internationalized URI reference',
  'uri-template': 'URI template',
  'json-pointer': 'JSON pointer',
  'relative-json-pointer': 'relative JSON pointer',
  'regex': 'regular expression'
};

export class StringFormatter implements Formatter {
  public format(error: ErrorObject): string {
    const { keyword, params } = error;

    switch (keyword) {
      case 'minLength':
      case 'maxLength': {
        const limit = params.limit;
        const direction = keyword === 'minLength' ? 'more' : 'fewer';

        return `must be of length ${limit} or ${direction}`;
      }

      case 'pattern': {
        return `does not match pattern ${params.pattern}`;
      }

      case 'format': {
        const label = formatLabelsMap[params.format] || params.format;

        return `must be a valid ${label} string`;
      }
    }
  }
}
