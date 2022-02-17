import { OperationObject, ParameterObject } from '../types';
import { OpenAPI } from '@har-sdk/core';

export const getParameters = (
  spec: OpenAPI.Document,
  path: string,
  method: string
): ParameterObject[] => {
  const pathObj: OperationObject = spec.paths[path][method];

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
