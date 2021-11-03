import { ErrorObject } from 'ajv/lib/types/index';

// Based on condenseErrors() from https://github.com/swagger-api/swagger-editor
//
// 1. group all errors by path
// 2. score them by message frequency
// 3. select the most frequent messages (retaining all equally-frequent messages)
// 4. concatenate the params of each occurrence of the most frequent message
// 5. create one condensed error for the path

export class ErrorCondenser {
  // tree: instancePath -> message -> errors
  private tree: Record<string, Record<string, ErrorObject[]>>;

  constructor(private readonly errors: ReadonlyArray<ErrorObject>) {}

  public condense(): ErrorObject[] {
    if (!Array.isArray(this.errors)) {
      return [];
    }

    this.parseToTree();

    return Object.keys(this.tree).reduce(
      (res: ErrorObject[], path: string): ErrorObject[] => {
        const frequentMessageErrors: ErrorObject[][] =
          this.detectMostFrequentMessageNames(path).map(
            (name) => this.tree[path][name]
          );

        return res.concat(
          frequentMessageErrors.map(this.mergeDuplicatedErrors.bind(this))
        );
      },
      []
    );
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

  private readonly arrayify = (thing: any): any[] =>
    thing === undefined || thing === null || Array.isArray(thing)
      ? thing
      : [thing];

  private mergeParameterObjects(objA = {}, objB = {}): Record<string, any> {
    if (!objA && !objB) {
      return undefined;
    }

    const res = {};

    Object.keys(objA).forEach((k) => {
      res[k] = this.arrayify(objA[k]);
    });

    Object.keys(objB).forEach((k) => {
      res[k] = [...(res[k] || []), ...this.arrayify(objB[k])];
    });

    return res;
  }
}
