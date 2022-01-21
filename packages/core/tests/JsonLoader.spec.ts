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
        message: 'Unexpected token ] in JSON at position 12',
        offset: 12
      }
    },
    {
      input: '{"foo": 1,}',
      output: {
        message: 'Unexpected token } in JSON at position 10',
        offset: 10
      }
    },
    {
      input: "{'foo': 1}",
      output: {
        message: "Unexpected token ' in JSON at position 1",
        offset: 1
      }
    },
    {
      input: '{"foo": 01}',
      output: {
        message: 'Unexpected number in JSON at position 9',
        offset: 9
      }
    },
    {
      input: '{"foo": 1.}',
      output: {
        message: 'Unexpected token } in JSON at position 10',
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
        message: 'Unexpected token . in JSON at position 0',
        offset: 0
      }
    }
  ].forEach(({ input, output }) =>
    it(`should throw specific error for invalid input \`${input}\``, () => {
      (() => loader.load(input)).should.throw(SyntaxError, output.message);
      output.message.should.contain(loader.getSyntaxErrorDetails().message);
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
