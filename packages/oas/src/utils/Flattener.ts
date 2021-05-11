import { isObject } from './isObject';

export class Flattener {
  public toFlattenArray(
    obj: Record<string, any>,
    options?: Record<string, any>
  ): string[] {
    const config = this.flattenConfig(options);

    config.verify();

    const paths = (ob: Record<string, any> = {}, head: string = ''): string[] =>
      Object.entries(ob).reduce((product, [key, value]: [string, any]) => {
        const fullPath = config.format(head, key);

        return isObject(value)
          ? product.concat(paths(value, fullPath))
          : product.concat(fullPath, value.toString());
      }, []);

    return paths(obj);
  }

  public toFlattenObject(
    obj: Record<string, any>,
    options?: Record<string, any>
  ): Record<string, any> {
    const config = this.flattenConfig(options);

    config.verify();

    const toReturn = {};

    const objKeys = Object.keys(obj);
    for (const key of objKeys) {
      if (typeof obj[key] == 'object' && obj[key] !== null) {
        const flatObject = this.toFlattenObject(obj[key]);

        const flatObjectKeys = Object.keys(flatObject);
        // eslint-disable-next-line max-depth
        for (const fObjectKey of flatObjectKeys) {
          const fullPath = config.format(key, fObjectKey);
          toReturn[fullPath] = flatObject[fObjectKey];
        }
      } else {
        toReturn[key] = obj[key];
      }
    }

    return toReturn;
  }

  private flattenConfig(options?: Record<string, any>): any {
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
}
