import { sample } from '../src';

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
    expect(result).toEqual(obj);
  });

  it('should use falsy example', () => {
    const schema = {
      type: 'string',
      example: false
    };
    const result = sample(schema);
    expect(result).toEqual(false);
  });

  it('should use enum', () => {
    const enumList = ['test1', 'test2'];
    const schema = {
      type: 'string',
      enum: enumList
    };
    const result = sample(schema);
    expect(result).toEqual(enumList[0]);
  });
});
