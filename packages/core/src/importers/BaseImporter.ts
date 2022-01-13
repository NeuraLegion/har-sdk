import { LoaderFactory } from '../loaders/LoaderFactory';
import { Importer } from './Importer';
import { DocFormat, Spec, Doc, DocType } from './Spec';

type LoadResult<T> = { doc: T; format: DocFormat };

export abstract class BaseImporter<
  TDocType extends DocType,
  TDoc = Doc<TDocType>
> implements Importer<TDocType, TDoc>
{
  private readonly loaderFactory = new LoaderFactory();

  protected constructor() {
    // noop
  }

  abstract get type(): TDocType;

  public abstract isSupported(spec: unknown): spec is TDoc;

  public async import(
    content: string,
    expectedFormat?: DocFormat
  ): Promise<Spec<TDocType, TDoc> | undefined> {
    const loadResult: LoadResult<TDoc> | undefined = this.load(
      content.trim(),
      expectedFormat
    );

    if (loadResult && this.isSupported(loadResult.doc)) {
      const { format, doc } = loadResult;
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

  private load(
    source: string,
    format?: DocFormat
  ): LoadResult<TDoc> | undefined {
    const docFormats: DocFormat[] = ['json', 'yaml'];

    return docFormats.reduce(
      (res: LoadResult<TDoc> | undefined, docFormat: DocFormat) => {
        if (res || (format && format !== docFormat)) {
          return res;
        }

        try {
          const doc = this.loaderFactory
            .getLoader(docFormat)
            .load(source) as TDoc;
          if (doc) {
            return { doc, format: docFormat };
          }
        } catch (e) {
          // noop
        }
      },
      undefined
    );
  }
}
