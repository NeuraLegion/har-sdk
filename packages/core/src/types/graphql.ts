import { IntrospectionQuery } from 'graphql';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GraphQL {
  export interface GraphQLEnvelope<
    T extends IntrospectionQuery | string | string[]
  > {
    url: string;
    data: T;
  }

  export type Document = GraphQLEnvelope<IntrospectionQuery>;
}

export * from 'graphql';
