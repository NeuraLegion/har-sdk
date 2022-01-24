import 'chai/register-should';
import { JsonLoader } from '../src/loaders/JsonLoader';

describe('JsonLoader', () => {
  let loader: JsonLoader;

  beforeEach(() => {
    loader = new JsonLoader();
  });

  [
    {
      input: '[1, 2, 3, 4,]',
      output: {
        message: 'Unexpected token ] in JSON',
        offset: 12
      }
    },
    {
      input: '{"foo": 1,}',
      output: {
        message: 'Unexpected token } in JSON',
        offset: 10
      }
    },
    {
      input: "{'foo': 1}",
      output: {
        message: "Unexpected token ' in JSON",
        offset: 1
      }
    },
    {
      input: '{"foo": 01}',
      output: {
        message: 'Unexpected number in JSON',
        offset: 9
      }
    },
    {
      input: '{"foo": 1.}',
      output: {
        message: 'Unexpected token } in JSON',
        offset: 10
      }
    },
    {
      input: '{"a": "b}',
      output: {
        message: 'Unexpected end of JSON input'
      }
    },
    {
      input: '{"}',
      output: {
        message: 'Unexpected end of JSON input'
      }
    },
    {
      input: '.',
      output: {
        message: 'Unexpected token . in JSON',
        offset: 0
      }
    }
  ].forEach(({ input, output }) =>
    it(`should throw specific error for invalid input \`${input}\``, () => {
      (() => loader.load(input)).should.throw(SyntaxError);

      const result = loader.getSyntaxErrorDetails();

      result.should.deep.eq(output);
    })
  );

  it(`should be no errors for valid json input`, () => {
    // act
    try {
      loader.load('{"key": "value"}');
    } catch {
      // noop
    }
    const result = loader.getSyntaxErrorDetails();

    // assert
    (typeof result).should.eq('undefined');
  });
});
