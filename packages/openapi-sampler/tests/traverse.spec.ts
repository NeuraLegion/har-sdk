import { sample, Specification } from '../src';

describe('traverse', () => {
  it('should not follow circular references in schema objects', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
    } = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          default: 'bar'
        }
      }
    };
    schema.properties.baz = schema;
    const expected = {
      foo: 'bar',
      baz: {
        foo: 'bar',
        baz: {}
      }
    };

    const result = sample(schema);
    expect(result).toEqual(expected);
  });

  it('should not follow circular references when more that one circular reference present', () => {
    const schema: {
      type: string;
      properties: Record<string, unknown>;
    } = {
      type: 'object',
      properties: {}
    };

    schema.properties.foo = schema;
    schema.properties.baz = schema;

    const expected = {
      foo: {
        foo: {},
        baz: {}
      },
      baz: {
        foo: {},
        baz: {}
      }
    };

    const result = sample(schema);

    expect(result).toEqual(expected);
  });

  it('should not detect false-positive circular references', () => {
    const a = {
      type: 'string',
      example: 'test'
    };

    const b = {
      type: 'integer',
      example: 1
    };

    const c = {
      type: 'object',
      properties: {
        test: {
          type: 'string'
        }
      }
    };

    const d = {
      type: 'array',
      items: {
        type: 'string'
      }
    };

    const e = {
      allOf: [c, c]
    };

    const f = {
      oneOf: [d, d]
    };

    const g = {
      anyOf: [c, c]
    };

    const h = { $ref: '#/components/schemas/a' };

    const nonCircularSchema = {
      type: 'object',
      properties: {
        a,
        aa: a,
        b,
        bb: b,
        c,
        cc: c,
        d,
        dd: d,
        e,
        ee: e,
        f,
        ff: f,
        g,
        gg: g,
        h,
        hh: h
      }
    };

    const expected = {
      a: 'test',
      aa: 'test',
      b: 1,
      bb: 1,
      c: { test: 'lorem' },
      cc: { test: 'lorem' },
      d: ['lorem'],
      dd: ['lorem'],
      e: { test: 'lorem' },
      ee: { test: 'lorem' },
      f: ['lorem'],
      ff: ['lorem'],
      g: { test: 'lorem' },
      gg: { test: 'lorem' },
      h: 'test',
      hh: 'test'
    };

    const result = sample(nonCircularSchema, {}, {
      components: { schemas: { a, nonCircularSchema } }
    } as unknown as Specification);

    expect(result).toEqual(expected);
  });
});
