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

  it('should condense duplicated errors', async () => {
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

  it('should pick most frequent error message', async () => {
    const condenser = new ErrorCondenser([
      {
        ...error,
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

  it('should preserve equally frequent error messages', async () => {
    const condenser = new ErrorCondenser([
      error,
      {
        ...error,
        message: 'msg2'
      },
      {
        ...error,
        message: 'msg2'
      },
      error
    ]);

    condenser.condense().should.deep.eq([error, { ...error, message: 'msg2' }]);
  });

  it('should do nothing with errors with different paths', async () => {
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
});
