import type { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export type OperationObject =
  | OpenAPIV2.OperationObject
  | OpenAPIV3.OperationObject;
export type ParameterObject = OpenAPIV3.ParameterObject | OpenAPIV2.Parameter;
export type PathItemObject =
  | OpenAPIV2.PathItemObject
  | OpenAPIV3.PathItemObject;
export type SecuritySchemeObject =
  | OpenAPIV2.SecuritySchemeObject
  | OpenAPIV3.SecuritySchemeObject;
export type SecurityRequirementObject =
  | OpenAPIV2.SecurityRequirementObject
  | OpenAPIV3.SecurityRequirementObject;
