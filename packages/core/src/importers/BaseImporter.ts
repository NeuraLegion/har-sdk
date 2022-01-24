import { Loader, LoaderFactory, SyntaxErrorDetails } from '../loaders';
import { Importer } from './Importer';
import { ImporterErrorProvider } from './ImporterErrorProvider';
import { DocFormat, Spec, Doc, DocType } from './Spec';

type LoadResult<T> = { doc: T; format: DocFormat };

export abstract class BaseImporter<
  TDocType extends DocType,
  TDoc = Doc<TDocType>
> implements Importer<TDocType, TDoc>, ImporterErrorProvider
{
  private readonly docFormats: DocFormat[] = ['json', 'yaml'];
  private readonly loaderFactory = new LoaderFactory();
  private readonly loaders = new Map<DocFormat, Loader>();

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

  public getErrorDetails(format: DocFormat): SyntaxErrorDetails | undefined {
    return this.getLoader(format)?.getSyntaxErrorDetails();
  }

  protected fileName(_: { doc: TDoc; format: DocFormat }): string | undefined {
    return;
  }

  private load(
    source: string,
    format?: DocFormat
  ): LoadResult<TDoc> | undefined {
    this.initLoaders();

    return this.docFormats.reduce(
      (res: LoadResult<TDoc> | undefined, docFormat: DocFormat) => {
        if (res || (format && format !== docFormat)) {
          return res;
        }

        try {
          const doc = this.getLoader(docFormat).load(source) as TDoc;
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

  private initLoaders(): void {
    this.loaders.clear();
    this.docFormats.forEach((docFormat: DocFormat) => {
      this.loaders.set(docFormat, this.loaderFactory.getLoader(docFormat));
    });
  }

  private getLoader(docFormat: DocFormat): Loader | undefined {
    return this.loaders.get(docFormat);
  }
}
