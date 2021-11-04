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

  const { keyword } = error;

  let message =
    /^(min|max)/.test(keyword) || /(Minimum|Maximum)$/.test(keyword)
      ? getMinMaxMessage(error)
      : getOtherMessage(error);

  if (!message) {
    message = error.message;
  }

  return `${location} ${message}`;
};

// eslint-disable-next-line
function getMinMaxMessage(error: ErrorObject): string {
  const { keyword, params } = error;

  switch (keyword) {
    case 'minLength':
    case 'maxLength': {
      const limit = params.limit;
      const direction = keyword === 'minLength' ? 'more' : 'fewer';

      return `must be of length ${limit} or ${direction}`;
    }

    case 'minimum':
    case 'maximum':
    case 'exclusiveMinimum':
    case 'exclusiveMaximum': {
      const direction = keyword.toLowerCase().includes('minimum')
        ? 'greater'
        : 'less';
      const inclusive = !keyword.startsWith('exclusive');

      return `must be${inclusive ? ' equal to or' : ''} ${direction} than ${
        params.limit
      }`;
    }

    case 'minProperties':
    case 'maxProperties':
    case 'minItems':
    case 'maxItems': {
      const direction = keyword.startsWith('min') ? 'more' : 'fewer';
      const entity = keyword.endsWith('Items') ? 'items' : 'properties';

      return `must have ${params.limit} or ${direction} ${entity}`;
    }
  }
}

function getOtherMessage(error: ErrorObject): string {
  const { keyword, params } = error;

  switch (keyword) {
    case 'enum': {
      const list = params.allowedValues.map(JSON.stringify);
      const allowed = humanizeList(list, 'or');

      return `must be one of: ${allowed}`;
    }

    case 'type': {
      const list = Array.isArray(params.type)
        ? params.type
        : params.type.split(',');
      const expectType = humanizeList(list, 'or');

      return `must be of type ${expectType}`;
    }

    case 'pattern': {
      return `does not match pattern ${params.pattern}`;
    }

    case 'format': {
      const label = formatLabelsMap[params.format] || params.format;

      return `must be a valid ${label} string`;
    }

    case 'additionalProperties': {
      return `has an unexpected property "${params.additionalProperty}"`;
    }

    case 'required': {
      return `is missing the required field '${params.missingProperty}'`;
    }

    case 'uniqueItems': {
      const { i, j } = params;

      return `must be unique but elements ${j} and ${i} are the same`;
    }
  }
}
