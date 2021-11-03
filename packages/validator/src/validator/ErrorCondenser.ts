import { ErrorObject } from 'ajv/lib/types/index';

// Based on ErrorCondenser from https://github.com/swagger-api/swagger-editor
//
// 1. group all errors by path
// 2. score them by message frequency
// 3. select the most frequent messages (ties retain all equally-frequent messages)
// 4. concatenate the params of each occurrence of the most frequent message
// 5. create one condensed error for the path
// 6. return all condensed errors as an array

export function condenseErrors(errors: ErrorObject[]): ErrorObject[] {
  if (!Array.isArray(errors)) {
    return [];
  }

  const tree: Record<string, Record<string, ErrorObject[]>> = {};

  errors.forEach((err: ErrorObject) => {
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

  return Object.keys(tree).reduce((res, path) => {
    const messages = Object.keys(tree[path]);

    const mostFrequentMessageNames: string[] = messages.reduce(
      (obj, msg) => {
        const count = tree[path][msg].length;

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

    const mostFrequentMessages: ErrorObject[][] = mostFrequentMessageNames.map(
      (name) => tree[path][name]
    );

    const condensedErrors = mostFrequentMessages.map((frequentMessages) =>
      frequentMessages.reduce((prev, err) => {
        const obj = Object.assign({}, prev, {
          params: mergeParams(prev.params, err.params)
        });

        if (!prev.params && !err.params) {
          delete obj.params;
        }

        return obj;
      })
    );

    return res.concat(condensedErrors);
  }, []);
}

// Helpers

function mergeParams(objA = {}, objB = {}) {
  if (!objA && !objB) {
    return undefined;
  }

  const res = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const k in objA) {
    if (Object.prototype.hasOwnProperty.call(objA, k)) {
      res[k] = arrayify(objA[k]);
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const k in objB) {
    if (Object.prototype.hasOwnProperty.call(objB, k)) {
      // eslint-disable-next-line max-depth
      if (res[k]) {
        const curr = res[k];
        res[k] = curr.concat(arrayify(objB[k]));
      } else {
        res[k] = arrayify(objB[k]);
      }
    }
  }

  return res;
}

function arrayify(thing: any): any[] {
  return thing === undefined || thing === null || Array.isArray(thing)
    ? thing
    : [thing];
}
