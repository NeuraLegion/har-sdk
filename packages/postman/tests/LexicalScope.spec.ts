import { LexicalScope } from '../src/parser';
import 'chai/register-should';

describe('LexicalScope', () => {
  describe('combine', () => {
    it('should combine two scopes into one', () => {
      // arrange
      const variables = [{ key: 'baseUrl', value: 'https://test.com' }];
      const scope = new LexicalScope('/path', variables);
      const anotherVariables = [
        { key: 'baseUrl', value: 'https://subdomain.test.com' }
      ];
      const anotherScope = new LexicalScope('/path', anotherVariables);

      // act
      const result = scope.combine(anotherScope);

      // assert
      [...result].should.deep.ordered.members([
        ...anotherVariables,
        ...variables
      ]);
    });

    it('should do nothing if the target scope is from  different place', () => {
      // arrange
      const scope = new LexicalScope('/path', [
        { key: 'baseUrl', value: 'https://test.com' }
      ]);
      const anotherVariables = [
        { key: 'baseUrl', value: 'https://subdomain.test.com' }
      ];
      const anotherScope = new LexicalScope('/path/sub-path', anotherVariables);

      // act
      const result = scope.combine(anotherScope);

      // assert
      [...result].should.not.deep.ordered.members(anotherVariables);
    });

    it('should add variables to the existing scope', () => {
      // arrange
      const variables = [{ key: 'baseUrl', value: 'https://test.com' }];
      const scope = new LexicalScope('/path', variables);
      const anotherVariables = [
        { key: 'baseUrl', value: 'https://subdomain.test.com' }
      ];

      // act
      const result = scope.combine(anotherVariables);

      // assert
      [...result].should.deep.ordered.members([
        ...anotherVariables,
        ...variables
      ]);
    });
  });

  describe('concat', () => {
    it('should create a new sub scope', () => {
      // arrange
      const variables = [{ key: 'baseUrl', value: 'https://test.com' }];
      const scope = new LexicalScope('/path', variables);
      const anotherVariables = [
        { key: 'baseUrl', value: 'https://subdomain.test.com' }
      ];

      // act
      const result = scope.concat('/sub-path', anotherVariables);

      // assert
      result.jsonPointer.should.eq('/path/sub-path');
      [...result].should.deep.ordered.members([
        ...anotherVariables,
        ...variables
      ]);
    });

    it('should remove trailing slash from json-pointer', () => {
      // arrange
      const scope = new LexicalScope('/path/', [
        { key: 'baseUrl', value: 'https://test.com' }
      ]);

      // act
      const result = scope.concat('/sub-path/', []);

      // assert
      result.jsonPointer.should.eq('/path/sub-path');
    });
  });

  describe('find', () => {
    it('should return a first matched variable if predicate returns true', () => {
      // arrange
      const scope = new LexicalScope('/', [
        { key: 'baseUrl', value: 'https://test.com' },
        { key: 'baseUrl', value: 'https://sub.test.com' }
      ]);

      // act
      const result = scope.find((x) => x.key === 'baseUrl');

      // assert
      result.should.deep.eq({ key: 'baseUrl', value: 'https://test.com' });
    });

    it('should return a undefined if predicate returns false for each variable', () => {
      // arrange
      const variable = { key: 'baseUrl', value: 'https://test.com' };
      const scope = new LexicalScope('/', [variable]);

      // act
      const result = scope.find((x) => x.key === 'x');

      // assert
      (typeof result).should.eq('undefined');
    });

    it('should throw a error if predicate is not defined', () => {
      // arrange
      const variable = { key: 'baseUrl', value: 'https://test.com' };
      const scope = new LexicalScope('/', [variable]);

      // act
      () =>
        scope
          .find(null as (...args: unknown[]) => unknown)
          .should.throw(TypeError);
    });
  });
});
