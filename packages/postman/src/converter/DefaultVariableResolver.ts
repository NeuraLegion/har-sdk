import { LexicalScope, VariableParser, VariableParserFactory } from '../parser';
import { VariableResolver } from './VariableResolver';
import { Postman } from '@har-sdk/core';
import jsonPointer from 'json-pointer';

interface RefToBeResolved {
  ref: string;
  root: Postman.Request;
  value: string;
  scope: LexicalScope;
}

export class DefaultVariableResolver implements VariableResolver {
  private readonly EXCLUDED_REFS = [
    '/certificate',
    '/description',
    '/method',
    '/proxy',
    '/url/raw',
    '/url/variable'
  ];
  private readonly PATH_ONLY_REFS = ['/url/path'];

  private readonly pathResolver: VariableParser;
  private readonly variableResolver: VariableParser;

  constructor(parserFactory: VariableParserFactory) {
    this.variableResolver = parserFactory.createEnvVariableParser();
    this.pathResolver = parserFactory.createUrlVariableParser();
  }

  public resolve(root: Postman.Request, scope: LexicalScope): Postman.Request {
    const refs = jsonPointer.dict(root);
    const targetRefs = Object.entries(refs).filter(
      ([ref, value]: [string, unknown]) => this.canResolveVariable(value, ref)
    );

    targetRefs.forEach(([ref, value]: [string, string]) => {
      const resolvedVariable = this.resolveVariable({
        ref,
        root,
        value,
        scope
      });

      if (resolvedVariable !== value) {
        jsonPointer.set(root, ref, resolvedVariable);
      }
    });

    return root;
  }

  private resolveVariable({
    ref,
    root,
    value,
    scope
  }: RefToBeResolved): string {
    if (this.PATH_ONLY_REFS.some((x: string) => ref.startsWith(x))) {
      const variables = typeof root.url !== 'string' ? root.url.variable : [];

      value = this.pathResolver.parse(
        value,
        scope.concat(ref, variables ?? [])
      );
    }

    return this.variableResolver.parse(value, scope.concat(ref, []));
  }

  private canResolveVariable(value: unknown, byRef: string): value is string {
    return (
      this.EXCLUDED_REFS.every((x: string) => !byRef.startsWith(x)) &&
      typeof value === 'string'
    );
  }
}
