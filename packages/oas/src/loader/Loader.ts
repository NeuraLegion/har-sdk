import { Collection } from '../converter';

export interface Loader {
  load(path: string): Promise<Collection>;
}
