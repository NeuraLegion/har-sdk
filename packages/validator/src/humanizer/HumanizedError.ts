import { ErrorObject } from 'ajv';

export interface ErrorMessagePart {
  text: string;
  jsonPointer?: string;
}

export interface HumanizedError {
  originalError: ErrorObject;
  message: string;
  messageParts: ErrorMessagePart[];
  locationParts: ErrorMessagePart[];
}
