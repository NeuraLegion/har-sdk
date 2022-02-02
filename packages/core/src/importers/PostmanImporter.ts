import { BaseImporter } from './BaseImporter';
import { ImporterType } from './ImporterType';
import { Postman } from '../types';
import { DocFormat } from './Spec';

export class PostmanImporter extends BaseImporter<ImporterType.POSTMAN> {
  private readonly POSTMAN_SCHEMAS: ReadonlySet<string> = new Set([
    'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
    'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  ]);

  constructor() {
    super();
  }

  get type(): ImporterType.POSTMAN {
    return ImporterType.POSTMAN;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public isSupported(spec: any): spec is Postman.Document {
    const schemaId = spec?.info?.schema;

    return (
      typeof schemaId === 'string' &&
      this.POSTMAN_SCHEMAS.has(schemaId.trim().toLowerCase())
    );
  }

  protected fileName({
    doc,
    format
  }: {
    doc: Postman.Document;
    format: DocFormat;
  }): string | undefined {
    return typeof doc?.info?.name === 'string'
      ? `${doc.info.name.trim()}.${format}`
      : undefined;
  }
}
