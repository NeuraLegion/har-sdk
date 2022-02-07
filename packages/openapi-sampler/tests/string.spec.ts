import { sample } from '../src';
import 'chai/register-should';

describe('StringSampler', () => {
  [
    {
      input: {
        type: 'string',
        format: 'email'
      },
      expected: 'jon.snow@targaryen.com'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '\\d{1,3}'
      },
      expected: '44'
    },
    {
      input: {
        type: 'string',
        format: 'password',
        minLength: 25
      },
      expected: 'p@$$w0rdp@$$w0rdp@$$w0rdp'
    },
    {
      input: {
        type: 'string',
        format: 'password',
        maxLength: 4
      },
      expected: 'p@$$'
    },
    {
      input: {
        type: 'string',
        format: 'binary'
      },
      expected: '\\x01\\x02\\x03\\x04\\x05'
    },
    {
      input: {
        type: 'string',
        format: 'dummy'
      },
      expected: 'lorem'
    },
    {
      input: {
        type: 'string',
        format: 'date-time'
      },
      expected: '2021-12-31T23:34:00Z'
    }
  ].forEach(({ input, expected }) => {
    const { type, format, ...restrictions } = input;
    const suffixStr = Object.keys(restrictions).length
      ? ` with restrictions ${JSON.stringify(restrictions)}`
      : '';
    it(`should sample \`${format}\` format string${suffixStr}`, () => {
      const result = sample(input);

      result.should.eq(expected);
    });
  });

  [
    {
      input: {
        type: 'string',
        maxLength: 5,
        minLength: 10
      },
      expected:
        'Cannot sample string by boundaries: minLength=10, maxLength=5, format=default'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '\\d{10,20}',
        maxLength: 5
      },
      expected:
        'Cannot sample string by boundaries: maxLength=5, format=pattern'
    },
    {
      input: {
        type: 'string',
        format: 'date',
        minLength: 11
      },
      expected: 'Cannot sample string by boundaries: minLength=11, format=date'
    },
    {
      input: {
        type: 'string',
        format: 'date',
        minLength: 11,
        maxLength: 20
      },
      expected:
        'Cannot sample string by boundaries: minLength=11, maxLength=20, format=date'
    }
  ].forEach(({ input, expected }) => {
    const { type, ...restrictions } = input;
    it(`should throw an error on controversial constrains ${JSON.stringify(
      restrictions
    )}`, () => {
      const result = () => sample(input);

      result.should.throw(expected);
    });
  });
});
