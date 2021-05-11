import { CaptureHar } from '../types/capture';

export const isReadable = (
  part: CaptureHar.Part
): part is CaptureHar.FromDataValue =>
  (part as CaptureHar.FromDataValue).options !== undefined;
