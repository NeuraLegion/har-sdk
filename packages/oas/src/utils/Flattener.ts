import { isObject } from './isObject';

export class Flattener {
  public static flattenConfig(options?: Record<string, any>): any {
    return {
      _options: Object.assign({ format: 'dots' }, options),
      ALLOWED_FORMATS: new Set(['indices', 'dots']),

      verify(): void {
        if (!this.ALLOWED_FORMATS.has(this._options.format)) {
          throw new TypeError('Invalid format');
        }
      },

      format<A, B>(a: A, b: B): B | string {
        if (!a) {
          return b;
        }

        switch (this._options.format) {
          case 'indices':
            return `${a}[${b}]`;
          case 'dots':
            return `${a}.${b}`;
        }
      }
    };
  }

  public static toFlattenArray(
    obj: Record<string, any>,
    options?: Record<string, any>
  ): string[] {
    const config = Flattener.flattenConfig(options);

    config.verify();

    // eslint-disable-next-line arrow-body-style
    const paths = (
      ob: Record<string, any> = {},
      head: string = ''
    ): string[] => {
      return Object.entries(ob).reduce(
        (product, [key, value]: [string, any]) => {
          const fullPath = config.format(head, key);

          return isObject(value)
            ? product.concat(paths(value, fullPath))
            : product.concat(fullPath, value.toString());
        },
        []
      );
    };

    return paths(obj);
  }

  public static toFlattenObject(
    ob: Record<string, any>,
    options?: Record<string, any>
  ): Record<string, any> {
    const config = Flattener.flattenConfig(options);

    config.verify();

    const toReturn = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const i in ob) {
      // eslint-disable-next-line no-prototype-builtins
      if (!ob.hasOwnProperty(i)) {
        continue;
      }

      if (typeof ob[i] == 'object' && ob[i] !== null) {
        const flatObject = Flattener.toFlattenObject(ob[i]);

        // TODO: check the loop
        // for (const x in flatObject) {
        //   // eslint-disable-next-line no-prototype-builtins
        //   if (!flatObject.hasOwnProperty(x)) {
        //     continue;
        //   }

        //   const fullPath = config.format(i, x);
        //   toReturn[fullPath] = flatObject[x];
        // }
      } else {
        toReturn[i] = ob[i];
      }
    }

    return toReturn;
  }
}
