import { Loader } from './Loader';
import { Collection } from '../converter';
import yaml from 'js-yaml';
import fs from 'fs';
import { promisify } from 'util';
import { extname } from 'path';
import { ok } from 'assert';

const readFile = promisify(fs.readFile);

export class DefaultLoader implements Loader {
  private readonly supportedExtensions: string[] = ['.yml', '.yaml'];

  public async load(path: string): Promise<Collection> {
    ok(path, 'Path is not provided.');

    const ext: string = extname(path);
    const content: string = await this.read(path);

    if (this.supportedExtensions.includes(ext.toLowerCase())) {
      return yaml.load(content) as Collection;
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
