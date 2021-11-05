import { ErrorCondenser } from '../src/validator/ErrorCondenser';
import { ErrorObject } from 'ajv';
import 'chai/register-should';

describe('ErrorCondenser', () => {
  const error: ErrorObject = {
    keyword: 'enum',
    instancePath: '/paths/~1path',
    schemaPath: '#/properties/in/enum',
    params: {},
    message: 'msg'
  };

  it('should condense duplicated errors', () => {
    const condenser = new ErrorCondenser(
      new Array(100).fill(null).map(() => ({
        ...error,
        params: {
          dummy: 42
        }
      }))
    );
    const result = condenser.condense();

    result.should.deep.eq([
      {
        ...error,
        params: { dummy: new Array(100).fill(42) }
      }
    ]);
  });

  it('should pick most frequent error message', () => {
    const condenser = new ErrorCondenser([
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
    ]);

    condenser.condense().should.deep.eq([{ ...error, message: 'msg2' }]);
  });

  it('should preserve equally frequent error messages', () => {
    const condenser = new ErrorCondenser([
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
    ]);

    condenser.condense().should.deep.eq([error, { ...error, message: 'msg2' }]);
  });

  it('should do nothing with errors with different paths', () => {
    const errors = [
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

    const condenser = new ErrorCondenser(errors);
    condenser.condense().should.deep.eq(errors.slice(1));
  });

  it('should filter out ancestor "if" branching errors', () => {
    const errors = [
      {
        instancePath: '/paths/~1pet~1{petId}~1uploadImage/post/produces',
        schemaPath: '#/type',
        keyword: 'type',
        params: { type: 'array' },
        message: 'must be array'
      },
      {
        instancePath: '/paths/~1pet~1{petId}~1uploadImage/post/parameters/0/in',
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

    const condenser = new ErrorCondenser(errors);
    condenser.condense().should.deep.eq(errors.slice(0, 2));
  });

  it('should keep "if" error if it is single error', () => {
    const errors = [
      {
        instancePath: '/paths/~1pet~1{petId}~1uploadImage/post/parameters/0',
        schemaPath: '#/items/if',
        keyword: 'if',
        params: { failingKeyword: 'else' },
        message: 'must match "else" schema'
      }
    ];

    const condenser = new ErrorCondenser(errors);
    condenser.condense().should.deep.eq(errors);
  });
});
