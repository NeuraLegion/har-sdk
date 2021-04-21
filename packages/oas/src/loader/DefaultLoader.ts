import { Loader } from './Loader';
import { OAS } from '../types/oas';
import yaml from 'js-yaml';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { ok } from 'assert';

export class DefaultLoader implements Loader {
  public async load(path: string): Promise<OAS.Collection> {
    ok(path, 'Path is not provided.');

    const ext = extname(path.toLowerCase());
    const content = await this.read(path);

    if (ext === '.yml' || ext === '.yaml') {
      return yaml.load(content) as OAS.Collection;
    }

    return JSON.parse(content);
  }

  private async read(path: string): Promise<string> {
    try {
      return await readFile(path, 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new Error('File not found!');
      }

      throw new Error('Cannot read file.');
    }
  }
}
