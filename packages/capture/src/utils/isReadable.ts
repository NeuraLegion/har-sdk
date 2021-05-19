import { FromDataValue, Part } from '../builder';

export const isReadable = (part: Part): part is FromDataValue =>
  (part as FromDataValue).options !== undefined;
