import {
  humanizeList,
  humanizeTypeOf,
  indefiniteArticle,
  pluralize
} from './Helpers';
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

  // The user can always specify a custom error message.
  // If so, then we want to just display their message.
  if (error.parentSchema?.errorMessage) {
    return `${location} ${error.parentSchema.errorMessage}`;
  }

  const { keyword, params, parentSchema, data } = error;

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
      const gotType = humanizeTypeOf(data);

      return `${location} must be ${indefiniteArticle(
        expectType
      )} ${expectType}${data ? ` but it was ${gotType}` : ''}`;
    }

    case 'minLength':
    case 'maxLength': {
      const limit = params.limit;
      const charsLimit = pluralize('character', limit);

      return `${location} must be ${limit} ${charsLimit} or ${
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

    case 'multipleOf': {
      return `${location} must be a multiple of ${params.multipleOf}`;
    }

    case 'minimum': {
      return `${location} must be equal to or greater than ${params.limit}`;
    }

    case 'exclusiveMinimum': {
      return `${location} must be greater than ${params.limit}`;
    }

    case 'maximum': {
      return `${location} must be equal to or less than ${params.limit}`;
    }

    case 'exclusiveMaximum': {
      return `${location} must be less than ${params.limit}`;
    }

    case 'additionalProperties': {
      const allowed = Object.keys(parentSchema?.properties || {}).join(', ');
      const found = params.additionalProperty;

      return `${location} has an unexpected property, ${found}, which is not in the list of allowed properties (${allowed})`;
    }

    case 'required': {
      const missingField = params.missingProperty;

      return `${location} is missing the required field '${missingField}'`;
    }

    case 'propertyNames': {
      return `${location} has an invalid property name ${JSON.stringify(
        params.propertyName
      )}`;
    }

    case 'minProperties': {
      const expected = params.limit;
      const actual = Object.keys(data).length;

      return `${location} must have ${expected} or more properties but it has ${actual}`;
    }

    case 'maxProperties': {
      const expected = params.limit;
      const actual = Object.keys(data).length;

      return `${location} must have ${expected} or fewer properties but it has ${actual}`;
    }

    case 'dependencies': {
      const prop = params.property;
      const missing = params.missingProperty;

      return `${location} must have property ${missing} when ${prop} is present`;
    }

    case 'minItems': {
      const min = params.limit;
      const actual = (data as any).length;

      return `${location} must have ${min} or more items but it has ${actual}`;
    }

    case 'maxItems': {
      const max = params.limit;
      const actual = (data as any).length;

      return `${location} must have ${max} or fewer items but it has ${actual}`;
    }

    case 'uniqueItems': {
      const { i, j } = params;

      return `${location} must be unique but elements ${j} and ${i} are the same`;
    }

    default:
      return `${location} ${error.message}`;
  }
};
