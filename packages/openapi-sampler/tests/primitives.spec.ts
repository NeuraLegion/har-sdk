import { sample } from '../src';
import 'chai/register-should';

describe('Primitives', () => {
  it('should sample string', () => {
    const schema = {
      type: 'string'
    };
    const result = sample(schema);
    result.should.be.a('string');
  });
  it('should sample number', () => {
    const schema = {
      type: 'number'
    };
    const result = sample(schema);
    result.should.be.a('number');
  });
  it('should sample boolean', () => {
    const schema = {
      type: 'boolean'
    };
    const result = sample(schema);
    result.should.be.a('boolean');
  });
  it('should use default property', () => {
    const schema = {
      type: 'number',
      default: 100
    };
    const result = sample(schema);
    result.should.equal(100);
  });
  it('should use null if type is not specified', () => {
    const schema = {};
    const result = sample(schema);
    (!result).should.be.true;
  });
});
