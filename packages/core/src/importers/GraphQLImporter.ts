import { BaseImporter } from './BaseImporter';
import { ImporterType } from './ImporterType';
import { isArrayOfStrings } from '../utils';
import { type DocFormat, type Spec } from './Spec';
import { GraphQL, introspectionFromSchema } from '../types';
import { loadSchema } from '@graphql-tools/load';
import { URL } from 'url';
import { type BinaryLike, createHash } from 'crypto';

export class GraphQLImporter extends BaseImporter<ImporterType.GRAPHQL> {
  get type(): ImporterType.GRAPHQL {
    return ImporterType.GRAPHQL;
  }

  constructor() {
    super();
  }

  public async import(
    content: string,
    expectedFormat?: DocFormat
  ): Promise<Spec<ImporterType.GRAPHQL, GraphQL.Document> | undefined> {
    try {
      const spec = await super.import(content, expectedFormat);

      return spec
        ? {
            ...spec,
            doc: await this.tryConvertSDL(spec.doc)
          }
        : spec;
    } catch {
      // noop
    }

    return Promise.resolve(undefined);
  }

  public isSupported(spec: unknown): spec is GraphQL.Document {
    return (
      this.isGraphQLSDLEnvelope(spec) ||
      this.isGraphQlIntrospectionEnvelope(spec)
    );
  }

  protected fileName({
    doc
  }: {
    doc: GraphQL.Document;
    format: DocFormat;
  }): string | undefined {
    const url = new URL(doc.url);
    const checkSum = this.generateCheckSum(url.toString());

    return `${url.hostname}-${checkSum}`.toLowerCase();
  }

  private async tryConvertSDL(
    obj: GraphQL.Document
  ): Promise<GraphQL.Document> {
    if (this.isGraphQLSDLEnvelope(obj)) {
      const schema = await loadSchema(obj.data, {
        loaders: []
      });

      return {
        ...obj,
        data: introspectionFromSchema(schema)
      };
    }

    return obj;
  }

  private isGraphQLSDLEnvelope(
    obj: unknown
  ): obj is GraphQL.GraphQLEnvelope<string | string[]> {
    return (
      typeof obj === 'object' &&
      'url' in obj &&
      typeof (obj as GraphQL.GraphQLEnvelope<string>).url === 'string' &&
      'data' in obj &&
      (typeof (obj as GraphQL.GraphQLEnvelope<string>).data === 'string' ||
        isArrayOfStrings((obj as GraphQL.GraphQLEnvelope<string[]>).data))
    );
  }

  private isGraphQlIntrospectionEnvelope(
    obj: unknown
  ): obj is GraphQL.Document {
    return (
      typeof obj === 'object' &&
      'url' in obj &&
      typeof (obj as GraphQL.Document).url === 'string' &&
      'data' in obj &&
      '__schema' in (obj as GraphQL.Document).data &&
      typeof (obj as GraphQL.Document).data.__schema === 'object'
    );
  }

  private generateCheckSum(value: BinaryLike): string {
    return createHash('md5').update(value).digest('hex');
  }
}
