import { sample } from '../src';


describe('StringSampler', () => {
  [
    {
      input: {
        maxLength: 55,
        minLength: 0,
        format: 'pattern',
        pattern: '^[A-Za-z0-9._%-]+@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{1,4}$',
        type: 'string'
      },
      expected: "gggggg@FFFFFF.FFFFFF.FFFFFF.FFFFFF.FFFFFF.FFFFFF.zz"
    },
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
        format: 'idn-email'
      },
      expected: 'джон.сноу@таргариен.укр'
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
        format: 'pattern',
        pattern: '^[a-z\\u05D0-\\u05EAA-Z0-9-/\\\\.\\u05F4,\'":&#;+()\\s]*$',
        maxLength: 50
      },
      expected: 'MMMMMMMMMMMMMMMMMMMMMMMMM'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^[A-Z0-9]*$',
        maxLength: 10
      },
      expected: 'RRRRR'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^[A-Z0-9]{1,15}$',
        maxLength: 10
      },
      expected: 'RRRRRRRR'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^\\w{5,5}\\d{5,5}$',
        maxLength: 10
      },
      expected: 'EEEEE44444'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        maxLength: 4,
        minLength: 4,
        pattern: '^[0-9]+$'
      },
      expected: '4444'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        minLength: 5,
        maxLength: 6,
        pattern: '^[0-9]+$'
      },
      expected: '444444'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        minLength: 5,
        maxLength: 100,
        pattern: '^[0-9]+$'
      },
      expected: '444444'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        minLength: 4,
        pattern: '^[0-9]+$'
      },
      expected: '44444'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        minLength: 4,
        pattern: '^[0-9]{4,5}$'
      },
      expected: '0000'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        minLength: 5,
        pattern: '^[0-9]{3,5}[A-Z]{3}$'
      },
      expected: '000AAA'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        maxLength: 4,
        minLength: 4,
        pattern: "[^<>%=']*$"
      },
      expected: 'QQQQ'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^[A-Z0-9]*$',
        maxLength: 0
      },
      expected: ''
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^[a]+[b]+$',
        maxLength: 2,
        minLength: 2
      },
      expected: 'ab'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^[a]{2,4}[b]{2,4}$',
        maxLength: 4,
        minLength: 4
      },
      expected: 'aabb'
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
      expected: '\x01\x02\x03\x04\x05'
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
        format: 'time'
      },
      expected: '23:34:00Z'
    },
    {
      input: {
        type: 'string',
        format: 'duration'
      },
      expected: 'P3D'
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
        format: 'idn-hostname'
      },
      expected: 'сломанные-кристаллы.бел'
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
        format: 'uri-reference'
      },
      expected: '../brokencrystals'
    },
    {
      input: {
        type: 'string',
        format: 'uri-template'
      },
      expected: 'https://brokencrystals.com/api/file/{provider}'
    },
    {
      input: {
        type: 'string',
        format: 'iri'
      },
      expected:
        'https://be.wikipedia.org/wiki/%D0%9A%D1%80%D1%8B%D1%88%D1%82%D0%B0%D0%BB%D1%96'
    },
    {
      input: {
        type: 'string',
        format: 'iri-reference'
      },
      expected: '/wiki/%D0%9A%D1%80%D1%8B%D1%88%D1%82%D0%B0%D0%BB%D1%96'
    },
    {
      input: {
        type: 'string',
        format: 'json-pointer'
      },
      expected: '/json/pointer'
    },
    {
      input: {
        type: 'string',
        format: 'relative-json-pointer'
      },
      expected: '1/relative/json/pointer'
    },
    {
      input: {
        type: 'string',
        format: 'regex'
      },
      expected: '/regex/'
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

      expect(result).toEqual(expected);
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
        'Sample string cannot be generated by boundaries: minLength=10, maxLength=5, format=default'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '\\d{10,20}',
        maxLength: 5
      },
      expected:
        'Sample string cannot be generated by boundaries: maxLength=5, format=pattern'
    },
    {
      input: {
        minLength: 5,
        pattern: '^[0-9]{3}',
        type: 'string'
      },
      expected:
        'Sample string cannot be generated by boundaries: minLength=5, format=pattern'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^[a]+[b]+$',
        maxLength: 1,
        minLength: 1
      },
      expected:
        'Sample string cannot be generated by boundaries: minLength=1, maxLength=1, format=pattern'
    },
    {
      input: {
        type: 'string',
        format: 'pattern',
        pattern: '^\\w{5,5}\\d{5,5}$',
        maxLength: 9
      },
      expected:
        'Sample string cannot be generated by boundaries: maxLength=9, format=pattern'
    },
    {
      input: {
        type: 'string',
        format: 'date',
        minLength: 11
      },
      expected:
        'Sample string cannot be generated by boundaries: minLength=11, format=date'
    },
    {
      input: {
        type: 'string',
        format: 'date',
        minLength: 1,
        maxLength: 9
      },
      expected:
        'Sample string cannot be generated by boundaries: minLength=1, maxLength=9, format=date'
    },
    {
      input: {
        type: 'string',
        format: 'uuid',
        maxLength: 35
      },
      expected:
        'Sample string cannot be generated by boundaries: maxLength=35, format=uuid'
    }
  ].forEach(({ input, expected }) => {
    const { type, ...restrictions } = input;
    it(`should throw an error on controversial constrains ${JSON.stringify(
      restrictions
    )}`, () => {
      const result = () => sample(input);

      expect(result).toThrowError(expected);
    });
  });
});
