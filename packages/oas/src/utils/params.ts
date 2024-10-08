import { ParameterObject } from '../types';
import { getOperation } from './operation';
import { OpenAPI } from '@har-sdk/core';

const assertDereferencedParam = (param: unknown): param is ParameterObject => {
  const isReference = !!param && typeof param === 'object' && '$ref' in param;

  if (isReference) {
    throw new Error('Specification document is expected to be dereferenced.');
  }

  return !isReference;
};

export const getParameters = (
  spec: OpenAPI.Document,
  path: string,
  method: string
): ParameterObject[] => {
  const params = [
    ...(spec.paths[path]?.parameters ?? []),
    ...(getOperation(spec, path, method)?.parameters ?? [])
  ].filter(assertDereferencedParam);

  const combinedParams = new Map<string, ParameterObject>(
    params.map((x) => [`${x.in}:${x.name}`, x])
  );

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
