import type { ParameterObject } from '../types';
import type { OpenAPI } from '@har-sdk/core';

const isParameter = (param: unknown): param is ParameterObject =>
  param && typeof param === 'object' && 'in' in param && 'name' in param;

const toParameters = (param: unknown): ParameterObject[] =>
  Array.isArray(param) ? param.filter(isParameter) : [];

export const getParameters = (
  spec: OpenAPI.Document,
  path: string,
  method: string
): ParameterObject[] => {
  const pathParams = toParameters(spec.paths[path]?.parameters);
  const operationParams = toParameters(spec.paths[path]?.[method]?.parameters);

  const combinedParams = new Map<string, ParameterObject>(
    pathParams.map((x) => [`${x.in}:${x.name}`, x])
  );

  operationParams.forEach((x) => combinedParams.set(`${x.in}:${x.name}`, x));

  return [...combinedParams.values()];
};

export const filterLocationParams = (
  params: ParameterObject[],
  location: string
): ParameterObject[] =>
  params.filter(
    (param) =>
      typeof param.in === 'string' && param.in.toLowerCase() === location
  );
