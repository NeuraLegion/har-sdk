import { Importer, Spec, SpecType } from './Importer';
import { ImporterType } from './ImporterType';
import { load } from 'js-yaml';

export abstract class BaseImporter<T extends ImporterType>
  implements Importer<T>
{
  protected constructor() {
    // noop
  }

  abstract get type(): T;

  public abstract isSupported(spec: unknown): spec is SpecType<T>;

  public async importSpec(content: string): Promise<Spec<T> | undefined> {
    const doc: unknown | undefined = this.readContent(content.trim());

    return doc && this.isSupported(doc)
      ? {
          doc,
          type: this.type,
          name: this.fileName(doc)
        }
      : undefined;
  }

  protected fileName(_: SpecType<T>): string | undefined {
    return;
  }

  protected readContent(content: string): unknown | undefined {
    let spec: unknown | undefined;

    try {
      spec = JSON.parse(content);
    } catch {
      // noop
    }

    if (!spec) {
      try {
        spec = load(content) as unknown as T;
      } catch {
        // noop
      }
    }

    return spec;
  }
}
