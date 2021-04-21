import { OAS } from '../types/oas';

export interface Loader {
  load(path: string): Promise<OAS.Collection>;
}
