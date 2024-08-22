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
  const pathParams = [...(spec.paths[path]?.parameters ?? [])].filter(
    assertDereferencedParam
  );
  const operationParams = [
    ...(getOperation(spec, path, method)?.parameters ?? [])
  ].filter(assertDereferencedParam);

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
