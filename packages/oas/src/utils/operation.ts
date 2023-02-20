import type { OperationObject } from '../types';
import type { OpenAPI } from '@har-sdk/core';

export const getOperation = (
  spec: OpenAPI.Document,
  path: string,
  method: string
): OperationObject | undefined => spec.paths[path]?.[method];
