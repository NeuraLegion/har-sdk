import { ErrorObject } from 'ajv';

export interface HumanizedError {
  originalError: ErrorObject;
  message: string;
}
