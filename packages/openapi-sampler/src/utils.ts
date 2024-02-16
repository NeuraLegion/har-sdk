import { Schema } from './traverse';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

const isObject = <T extends Record<string, unknown>>(obj: T): obj is T =>
  obj && typeof obj === 'object';

export const mergeDeep = (
  ...objects: Record<string, any>[]
): Record<string, any> =>
  objects.reduce(
    (prev, obj) => {
      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (isObject(pVal) && isObject(oVal)) {
          prev[key] = mergeDeep(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    },
    Array.isArray(objects[objects.length - 1]) ? [] : {}
  );

export const firstArrayElement = <T>(x: T[]): T | undefined => x[0];

export const getReplacementForCircular = (type: string) => ({
  value: type === 'object' ? {} : type === 'array' ? [] : undefined
});

export const hasExample = (
  schema: Schema
): schema is OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject =>
  (schema as any).example !== undefined;

export const hasDefault = (
  schema: Schema
): schema is OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject =>
  (schema as any).default !== undefined;

export const isArraySchema = (
  schema: Schema
): schema is OpenAPIV3.ArraySchemaObject | OpenAPIV2.SchemaObject =>
  (schema as any).items !== undefined;

export const isReference = (
  schema: Schema
): schema is OpenAPIV3.ReferenceObject | OpenAPIV2.ReferenceObject =>
  (schema as any).$ref !== undefined;
