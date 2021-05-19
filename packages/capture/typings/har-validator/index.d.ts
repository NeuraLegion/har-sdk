declare module 'har-validator' {
  import { Har } from 'har-format';

  export function har(data: Har): Promise<Har | never>;
}
