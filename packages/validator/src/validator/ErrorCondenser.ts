import { ErrorObject } from 'ajv/lib/types/index';

// Based on condenseErrors() from https://github.com/swagger-api/swagger-editor
//
// 1. group all errors by path
// 2. score them by message frequency
// 3. select the most frequent messages (ties retain all equally-frequent messages)
// 4. concatenate the params of each occurrence of the most frequent message
// 5. create one condensed error for the path
// 6. return all condensed errors as an array

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
    const tree: Record<string, Record<string, ErrorObject[]>> = {};

    this.errors.forEach((err: ErrorObject) => {
      const { instancePath, message } = err;

      if (tree[instancePath] && tree[instancePath][message]) {
        tree[instancePath][message].push(err);
      } else if (tree[instancePath]) {
        tree[instancePath][message] = [err];
      } else {
        tree[instancePath] = {
          [message]: [err]
        };
      }
    });

    this.tree = tree;
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

          return obj;
        } else {
          return obj;
        }
      },
      { max: 0, messages: [] }
    ).messages;
  }

  private mergeDuplicatedErrors(errors: ErrorObject[]): ErrorObject {
    return errors.reduce((prev: ErrorObject, err: ErrorObject): ErrorObject => {
      const obj = Object.assign({}, prev, {
        params: this.mergeParameterObjects(prev.params, err.params)
      });

      if (!prev.params && !err.params) {
        delete obj.params;
      }

      return obj;
    });
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
