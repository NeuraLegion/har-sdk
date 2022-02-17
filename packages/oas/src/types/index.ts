import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export type OperationObject =
  | OpenAPIV2.OperationObject
  | OpenAPIV3.OperationObject;
export type ParameterObject = OpenAPIV3.ParameterObject | OpenAPIV2.Parameter;
