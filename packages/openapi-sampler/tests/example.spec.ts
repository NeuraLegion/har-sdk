import { sample } from '../src';
import 'chai/register-should';

describe('Example', () => {
  it('should use example', () => {
    const obj = {
      test: 'test',
      properties: {
        test: {
          type: 'string'
        }
      }
    };
    const schema = {
      type: 'object',
      example: obj
    };
    const result = sample(schema);
    result.should.deep.equal(obj);
  });

  it('should use falsy example', () => {
    const schema = {
      type: 'string',
      example: false
    };
    const result = sample(schema);
    result.should.deep.equal(false);
  });

  it('should use enum', () => {
    const enumList = ['test1', 'test2'];
    const schema = {
      type: 'string',
      enum: enumList
    };
    const result = sample(schema);
    result.should.be.eq(enumList[0]);
  });
});
