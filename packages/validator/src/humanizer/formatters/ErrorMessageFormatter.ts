import { humanizeList } from './Helpers';
import { ErrorObject } from 'ajv';

// based on https://github.com/segmentio/action-destinations/tree/main/packages/ajv-human-errors

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

export const formatLocation = (error: ErrorObject): string => {
  if (error.instancePath === '') {
    return 'the root value';
  }

  return `the value at ${error.instancePath}`;
};

// eslint-disable-next-line complexity
export const getMessage = (error: ErrorObject): string => {
  const location = formatLocation(error);

  const { keyword, params } = error;

  switch (keyword) {
    case 'enum': {
      const list = params.allowedValues.map(JSON.stringify);
      const allowed = humanizeList(list, 'or');

      return `${location} must be one of: ${allowed}`;
    }

    case 'type': {
      const list = Array.isArray(params.type)
        ? params.type
        : params.type.split(',');
      const expectType = humanizeList(list, 'or');

      return `${location} must be of type ${expectType}`;
    }

    case 'minLength':
    case 'maxLength': {
      const limit = params.limit;

      return `${location} must be of length ${limit} or ${
        keyword === 'minLength' ? 'more' : 'fewer'
      }`;
    }

    case 'pattern': {
      return `${location} does not match pattern ${params.pattern}`;
    }

    case 'format': {
      const label = formatLabelsMap[params.format] || params.format;

      return `${location} must be a valid ${label} string`;
    }

    case 'minimum':
    case 'maximum': {
      const direction = keyword === 'minimum' ? 'greater' : 'less';

      return `${location} must be equal to or ${direction} than ${params.limit}`;
    }

    case 'exclusiveMinimum':
    case 'exclusiveMaximum': {
      const direction = keyword === 'exclusiveMinimum' ? 'greater' : 'less';

      return `${location} must be ${direction} than ${params.limit}`;
    }

    case 'additionalProperties': {
      return `${location} has an unexpected property "${params.additionalProperty}"`;
    }

    case 'required': {
      return `${location} is missing the required field '${params.missingProperty}'`;
    }

    case 'minProperties':
    case 'maxProperties': {
      const expected = params.limit;
      const direction = keyword === 'minProperties' ? 'more' : 'fewer';

      return `${location} must have ${expected} or ${direction} properties`;
    }

    case 'minItems':
    case 'maxItems': {
      const limit = params.limit;
      const direction = keyword === 'minItems' ? 'more' : 'fewer';

      return `${location} must have ${limit} or ${direction} items`;
    }

    case 'uniqueItems': {
      const { i, j } = params;

      return `${location} must be unique but elements ${j} and ${i} are the same`;
    }

    default:
      return `${location} ${error.message}`;
  }
};
