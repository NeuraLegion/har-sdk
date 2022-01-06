import { sample } from '../src';
import 'chai/register-should';

describe('Primitives', () => {
  it('should sample deterministic string', () => {
    const schema = {
      type: 'string'
    };
    const result = sample(schema);
    result.should.eq('lorem');
  });

  it('should sample number', () => {
    const schema = {
      type: 'number',
      min: 10
    };
    const result = sample(schema);

    // TODO
    result.should.be.a('number');
  });

  it('should sample deterministic boolean', () => {
    const schema = {
      type: 'boolean'
    };
    const result = sample(schema);
    result.should.eq(true);
  });

  it('should use default property', () => {
    const schema = {
      type: 'number',
      default: 100
    };
    const result = sample(schema);
    result.should.eq(100);
  });

  it('should use null if type is not specified', () => {
    const schema = {};
    const result = sample(schema);
    (!result).should.be.true;
  });
});
