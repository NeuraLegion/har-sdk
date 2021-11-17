import { Importer } from './Importer';
import { DocFormat, Spec, Doc, DocType } from './Spec';
import { load } from 'js-yaml';

interface LoadedFile {
  doc: unknown;
  format: DocFormat;
}

export abstract class BaseImporter<
  TDocType extends DocType,
  TDoc = Doc<TDocType>
> implements Importer<TDocType, TDoc>
{
  protected constructor() {
    // noop
  }

  abstract get type(): TDocType;

  public abstract isSupported(spec: unknown): spec is TDoc;

  public async import(
    content: string
  ): Promise<Spec<TDocType, TDoc> | undefined> {
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

  protected fileName(_: { doc: TDoc; format: DocFormat }): string | undefined {
    return;
  }

  protected load(content: string): LoadedFile | undefined {
    let doc: unknown | undefined = this.loadFromJson(content);
    let format: DocFormat = 'json';

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
