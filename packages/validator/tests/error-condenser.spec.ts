import { ErrorCondenser } from '../src/validator/ErrorCondenser';
import { ErrorObject } from 'ajv';

describe('ErrorCondenser', () => {
  const error: ErrorObject = {
    keyword: 'enum',
    instancePath: '/paths/~1path',
    schemaPath: '#/properties/in/enum',
    params: {},
    message: 'msg'
  };

  describe('condense', () => {
    it('should condense duplicated errors', () => {
      const input = new Array(100).fill(null).map(() => ({
        ...error,
        params: {
          dummy: 42
        }
      }));

      const expected = [
        {
          ...error,
          params: { dummy: new Array(100).fill(42) }
        }
      ];

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });

    it('should pick most frequent error message', () => {
      const input = [
        {
          ...error,
          params: null,
          message: 'msg2'
        },
        {
          ...error,
          message: 'msg2'
        },
        error
      ];

      const expected = [{ ...error, message: 'msg2' }];

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });

    it('should preserve equally frequent error messages', () => {
      const input = [
        error,
        {
          ...error,
          message: 'msg2'
        },
        {
          ...error,
          params: null,
          message: 'msg2'
        },
        error
      ];

      const expected = [error, { ...error, message: 'msg2' }];

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });

    it('should do nothing with errors with different paths', () => {
      const input = [
        error,
        error,
        {
          ...error,
          instancePath: '/path2'
        },
        {
          ...error,
          instancePath: '/path3'
        }
      ];

      const expected = input.slice(1);

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });

    it('should filter out ancestor "if" branching errors', () => {
      const input = [
        {
          instancePath: '/paths/~1pet~1{petId}~1uploadImage/post/produces',
          schemaPath: '#/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array'
        },
        {
          instancePath:
            '/paths/~1pet~1{petId}~1uploadImage/post/parameters/0/in',
          schemaPath: '#/properties/in/enum',
          keyword: 'enum',
          params: { allowedValues: [Array] },
          message: 'must be equal to one of the allowed values'
        },
        {
          instancePath: '/paths/~1pet~1{petId}~1uploadImage/post/parameters/0',
          schemaPath: '#/items/if',
          keyword: 'if',
          params: { failingKeyword: 'else' },
          message: 'must match "else" schema'
        }
      ];

      const expected = input.slice(0, 2);

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });

    it('should filter out ancestor "anyOf" branching errors', () => {
      const input = [
        {
          instancePath: '/item/0/request/body/formdata/0/type',
          schemaPath:
            '#/else/properties/body/else/properties/formdata/items/anyOf/0/properties/type/const',
          keyword: 'const',
          params: { allowedValue: ['text', 'file'] },
          message: 'must be equal to constant'
        },
        {
          instancePath: '/item/0/request/body/formdata/0',
          schemaPath:
            '#/else/properties/body/else/properties/formdata/items/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf'
        }
      ];

      const expected = input.slice(0, 1);

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });

    it('should filter out self branching errors', () => {
      const input = [
        {
          instancePath: '/item/0/request/body/formdata/0',
          schemaPath:
            '#/else/properties/body/else/properties/formdata/items/then/required',
          keyword: 'required',
          params: {
            missingProperty: 'key'
          },
          message: "must have required property 'key'"
        },
        {
          instancePath: '/item/0/request/body/formdata/0',
          schemaPath:
            '#/else/properties/body/else/properties/formdata/items/if',
          keyword: 'if',
          params: {
            failingKeyword: 'then'
          },
          message: 'must match "then" schema'
        }
      ];

      const expected = input.slice(0, 1);

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });

    it('should keep "if" error if it is single error', () => {
      const input = [
        {
          instancePath: '/paths/~1pet~1{petId}~1uploadImage/post/parameters/0',
          schemaPath: '#/items/if',
          keyword: 'if',
          params: { failingKeyword: 'else' },
          message: 'must match "else" schema'
        }
      ];

      const expected = input;

      const result = new ErrorCondenser(input).condense();

      expect(result).toEqual(expected);
    });
  });
});
