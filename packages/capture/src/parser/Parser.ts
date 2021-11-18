import { Response } from 'request';

export interface Parser {
  parseRedirectUrl(response: Response): [Record<string, string> | null, string];
}
