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
    },
    {
      input: {
        type: 'string',
        format: 'ipv4',
        maxLength: 100
      },
      expected: '208.67.222.222'
    },
    {
      input: {
        type: 'string',
        format: 'ipv6',
        minLength: 39
      },
      expected: '0000:0000:0000:0000:0000:ffff:d043:dcdc'
    },
    {
      input: {
        type: 'string',
        format: 'hostname',
        minLength: 1
      },
      expected: 'brokencrystals.com'
    },
    {
      input: {
        type: 'string',
        format: 'uri'
      },
      expected: 'https://github.com/NeuraLegion/brokencrystals'
    },
    {
      input: {
        type: 'string',
        format: 'byte',
        minLength: 1,
        maxLength: 100
      },
      expected: 'ZHVtbXkgYmluYXJ5IHNhbXBsZQA='
    },
    {
      input: {
        type: 'string',
        format: 'base64',
        minLength: 28
      },
      expected: 'ZHVtbXkgYmluYXJ5IHNhbXBsZQA='
    },
    {
      input: {
        type: 'string',
        format: 'uuid',
        minLength: 1,
        maxLength: 36
      },
      expected: 'fbdf5a53-161e-4460-98ad-0e39408d8689'
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
        minLength: 1,
        maxLength: 9
      },
      expected:
        'Cannot sample string by boundaries: minLength=1, maxLength=9, format=date'
    },
    {
      input: {
        type: 'string',
        format: 'uuid',
        maxLength: 35
      },
      expected: 'Cannot sample string by boundaries: maxLength=35, format=uuid'
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
