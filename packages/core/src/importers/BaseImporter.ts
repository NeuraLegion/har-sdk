import { FileFormat, Importer, Spec, SpecType } from './Importer';
import { ImporterType } from './ImporterType';
import { load } from 'js-yaml';

interface LoadedFile {
  doc: unknown;
  format: FileFormat;
}

export abstract class BaseImporter<T extends ImporterType>
  implements Importer<T>
{
  protected constructor() {
    // noop
  }

  abstract get type(): T;

  public abstract isSupported(spec: unknown): spec is SpecType<T>;

  public async importSpec(content: string): Promise<Spec<T> | undefined> {
    const file: LoadedFile | undefined = this.load(content.trim());

    if (file && this.isSupported(file.doc)) {
      const { format, doc } = file;
      const name = this.fileName({ format, doc });

      return {
        doc,
        name,
        format,
        type: this.type
      };
    }
  }

  protected fileName(_: {
    doc: SpecType<T>;
    format: FileFormat;
  }): string | undefined {
    return;
  }

  protected load(content: string): LoadedFile | undefined {
    let doc: unknown | undefined = this.loadFromJson(content);
    let format: FileFormat = 'json';

    if (!doc) {
      doc = this.loadFromYaml(content);
      format = 'yaml';
    }

    return doc ? { doc, format } : undefined;
  }

  private loadFromJson(source: string): unknown | undefined {
    try {
      return JSON.parse(source);
    } catch {
      // noop
    }
  }

  private loadFromYaml(source: string): unknown | undefined {
    try {
      return load(source, { json: true });
    } catch {
      // noop
    }
  }
}
