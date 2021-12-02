import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

const formatLabelsMap: Readonly<Record<string, string>> = {
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
  public format(
    error:
      | ErrorObject<'minLength' | 'maxLength', { limit: number }>
      | ErrorObject<'pattern', { pattern: string }>
      | ErrorObject<'format', { format: string }>
  ): string {
    const propName = WordingHelper.extractPropertyName(error.instancePath);

    switch (error.keyword) {
      case 'minLength':
      case 'maxLength':
        return `The property \`${propName}\` must have a value of length ${
          error.params.limit
        } or ${WordingHelper.getComparison(error.keyword)} characters`;

      case 'pattern':
        return `The property \`${propName}\` must have a value that matches the pattern \`${error.params.pattern}\``;

      case 'format':
        return `The property \`${propName}\` must have a value that is a valid ${
          formatLabelsMap[error.params.format] || error.params.format
        } string`;
    }
  }
}
