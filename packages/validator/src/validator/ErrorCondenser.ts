import { ErrorObject } from 'ajv';

// Based on condenseErrors() from https://github.com/swagger-api/swagger-editor
//
// 1. group all errors by path
// 2. score them by message frequency
// 3. select the most frequent messages (retaining all equally-frequent messages)
// 4. concatenate the params of each occurrence of the most frequent message
// 5. create one condensed error for the path

export class ErrorCondenser {
  // tree: instancePath -> message -> errors
  private tree?: Record<string, Record<string, ErrorObject[]>>;

  constructor(private readonly errors: ReadonlyArray<ErrorObject>) {
    this.parseToTree();
  }

  public condense(): ErrorObject[] {
    const condensedErrors = Object.keys(this.tree).flatMap(
      (path: string): ErrorObject[] => {
        const frequentMessageErrors: ErrorObject[][] =
          this.detectMostFrequentMessageNames(path).map(
            (name) => this.tree[path][name]
          );

        return frequentMessageErrors.map(this.mergeDuplicatedErrors.bind(this));
      }
    );

    return this.filterRedundantIfKeywords(condensedErrors);
  }

  private parseToTree(): void {
    this.tree = this.errors.reduce(
      (
        res: Record<string, Record<string, ErrorObject[]>>,
        err: ErrorObject
      ) => {
        const { instancePath, message } = err;

        res[instancePath] = {
          ...(res[instancePath] || {}),
          [message]: [...(res[instancePath]?.[message] || []), err]
        };

        return res;
      },
      {}
    );
  }

  private detectMostFrequentMessageNames(path: string): string[] {
    return Object.keys(this.tree[path]).reduce(
      (obj, msg) => {
        const count = this.tree[path][msg].length;

        if (count > obj.max) {
          return {
            messages: [msg],
            max: count
          };
        } else if (count === obj.max) {
          obj.messages.push(msg);
        }

        return obj;
      },
      { max: 0, messages: [] }
    ).messages;
  }

  private mergeDuplicatedErrors(errors: ErrorObject[]): ErrorObject {
    return errors.reduce(
      (prev: ErrorObject, err: ErrorObject): ErrorObject =>
        Object.assign({}, prev, {
          ...(!prev.params && !err.params
            ? {}
            : { params: this.mergeParameterObjects(prev.params, err.params) })
        })
    );
  }

  private arrayify(thing: any): any[] {
    return thing == null || Array.isArray(thing) ? thing : [thing];
  }

  private mergeParameterObjects(objA = {}, objB = {}): Record<string, any> {
    const res = {};

    (objA ? Object.keys(objA) : []).forEach((k) => {
      res[k] = this.arrayify(objA[k]);
    });

    (objB ? Object.keys(objB) : []).forEach((k) => {
      res[k] = [...(res[k] || []), ...this.arrayify(objB[k])];
    });

    return res;
  }

  private filterRedundantIfKeywords(errors: ErrorObject[]): ErrorObject[] {
    const paths = Object.keys(this.tree);

    return errors.filter(
      (error: ErrorObject) =>
        (error.keyword !== 'if' && error.keyword !== 'anyOf') ||
        paths
          .filter((path) => path !== error.instancePath)
          .every((path) => !path.startsWith(error.instancePath))
    );
  }
}
