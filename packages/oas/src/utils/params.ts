import type { ParameterObject } from '../types';
import { getOperation } from './operation';
import type { OpenAPI } from '@har-sdk/core';

export const getParameters = (
  spec: OpenAPI.Document,
  path: string,
  method: string
): ParameterObject[] => {
  const pathObj = getOperation(spec, path, method);

  return Array.isArray(pathObj.parameters)
    ? (pathObj.parameters as ParameterObject[])
    : [];
};

export const filterLocationParams = (
  params: ParameterObject[],
  location: string
): ParameterObject[] =>
  params.filter(
    (param) =>
      typeof param.in === 'string' && param.in.toLowerCase() === location
  );
