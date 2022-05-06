// eslint-disable-next-line max-classes-per-file
import { BaseLoader } from '../src/loaders/BaseLoader';
import { BaseSyntaxErrorDetailsExtractor } from '../src/loaders/errors/BaseSyntaxErrorDetailsExtractor';

describe('BaseLoader', () => {
  class CustomError extends Error {
    constructor() {
      super('CustomError message');
    }
  }

  class CustomSyntaxErrorDetailsExtractor extends BaseSyntaxErrorDetailsExtractor<SyntaxError> {
    protected extractOffset(): undefined {
      return undefined;
    }
  }

  class UnsupportedErrorLoader extends BaseLoader {
    constructor() {
      super(new CustomSyntaxErrorDetailsExtractor());
    }

    protected isSupportedError(): boolean {
      return false;
    }

    protected parse(): unknown {
      throw new CustomError();
    }
  }

  class SupportedErrorLoader extends BaseLoader {
    constructor() {
      super(new CustomSyntaxErrorDetailsExtractor());
    }

    protected isSupportedError(): boolean {
      return true;
    }

    protected parse(): unknown {
      throw new CustomError();
    }
  }

  it(`should return origin error message for unknown errors`, () => {
    // arrange
    const loader = new UnsupportedErrorLoader();

    // act
    try {
      loader.load(null);
    } catch {
      // noop
    }
    const result = loader.getSyntaxErrorDetails();

    // assert
    expect(result).toEqual({
      message: 'CustomError message'
    });
  });

  it(`should return origin error message for known errors by default`, () => {
    // arrange
    const loader = new SupportedErrorLoader();

    // act
    try {
      loader.load(null);
    } catch {
      // noop
    }
    const result = loader.getSyntaxErrorDetails();

    // assert
    expect(result).toEqual({
      message: 'CustomError message'
    });
  });
});
