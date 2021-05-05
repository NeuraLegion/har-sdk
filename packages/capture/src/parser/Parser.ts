import { Response } from 'request';

export interface Parser {
  parseHttpVersion(response: Response): string;
  parseRedirectUrl(response: Response): [Record<string, string> | null, string];
}
