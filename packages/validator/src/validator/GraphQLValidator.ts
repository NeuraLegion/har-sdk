import { BaseValidator } from './BaseValidator';
import schema from '../schemas/graphql/2024-03-20-draft.json';
import { GraphQL } from '@har-sdk/core';

export class GraphQLValidator extends BaseValidator<GraphQL.Document> {
  private readonly SCHEMA_ID =
    'https://github.com/graphql/graphql-spec/blob/main/spec/GraphQL.md';

  constructor() {
    super([schema]);
  }

  protected getSchemaId(_: GraphQL.Document): string {
    return this.SCHEMA_ID;
  }
}
