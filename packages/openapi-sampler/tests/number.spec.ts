import { sample } from '../src';
import 'chai/register-should';

describe('NumberSampler', () => {
  it('should sample number', () => {
    const schema = {
      type: 'number'
    };
    const result = sample(schema);

    result.should.be.eq(42);
  });

  it('should sample number with minimum', () => {
    const schema = {
      type: 'number',
      minimum: 10
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should sample number with exclusiveMinimum', () => {
    const schema = {
      type: 'number',
      minimum: 10,
      exclusiveMinimum: true
    };
    const result = sample(schema);

    result.should.be.eq(10.001);
  });

  it('should sample integer with minimum', () => {
    const schema = {
      type: 'integer',
      minimum: 10
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should sample integer with non-integer minimum', () => {
    const schema = {
      type: 'integer',
      minimum: 9.3
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should sample integer with exclusiveMinimum', () => {
    const schema = {
      type: 'integer',
      minimum: 10,
      exclusiveMinimum: true
    };
    const result = sample(schema);

    result.should.be.eq(11);
  });

  it('should sample number with maximum', () => {
    const schema = {
      type: 'number',
      maximum: 10
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should sample number with exclusiveMaximum', () => {
    const schema = {
      type: 'number',
      maximum: 10,
      exclusiveMaximum: true
    };
    const result = sample(schema);

    result.should.be.eq(9.999);
  });

  it('should sample integer with maximum', () => {
    const schema = {
      type: 'integer',
      maximum: 10
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should sample integer with non-integer maximum', () => {
    const schema = {
      type: 'integer',
      maximum: 10.3
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should sample integer with exclusiveMaximum', () => {
    const schema = {
      type: 'integer',
      maximum: 10,
      exclusiveMaximum: true
    };
    const result = sample(schema);

    result.should.be.eq(9);
  });

  it('should prefer minimum over maximum on sampling', () => {
    const schema = {
      type: 'integer',
      minimum: 5,
      maximum: 10,
      exclusiveMinimum: false,
      exclusiveMaximum: true
    };
    const result = sample(schema);

    result.should.be.eq(5);
  });

  it('should correctly sample with 0 minimum value', () => {
    const schema = {
      type: 'integer',
      minimum: 0
    };
    const result = sample(schema);

    result.should.be.eq(0);
  });

  it('should correctly sample with 0 exclusive minimum value', () => {
    const schema = {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true
    };
    const result = sample(schema);

    result.should.be.eq(0.001);
  });

  it('should correctly sample with 0 exclusive maximum value', () => {
    const schema = {
      type: 'integer',
      maximum: 0,
      exclusiveMaximum: true
    };
    const result = sample(schema);

    result.should.be.eq(-1);
  });

  it('should correctly sample integer with multipleOf', () => {
    const schema = {
      type: 'integer',
      multipleOf: 10
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should correctly sample integer with zero multipleOf', () => {
    const schema = {
      type: 'integer',
      minimum: 10,
      multipleOf: 0
    };
    const result = sample(schema);

    result.should.be.eq(10);
  });

  it('should correctly sample integer with multipleOf', () => {
    const schema = {
      type: 'integer',
      minimum: 25,
      multipleOf: 10
    };
    const result = sample(schema);

    result.should.be.eq(30);
  });

  it('should correctly sample number with float multipleOf', () => {
    const schema = {
      type: 'number',
      multipleOf: 13.3
    };
    const result = sample(schema);

    result.should.be.eq(13.3);
  });

  it('should correctly sample number with float multipleOf and minimum', () => {
    const schema = {
      type: 'number',
      minimum: 135,
      multipleOf: 13.3
    };
    const result = sample(schema);

    result.should.be.eq(146.3);
  });

  it('should correctly sample number with float multipleOf and negative minimum', () => {
    const schema = {
      type: 'number',
      minimum: -20,
      multipleOf: 13.3
    };
    const result = sample(schema);

    result.should.be.eq(-13.3);
  });

  it('should correctly sample number with float multipleOf and maximum', () => {
    const schema = {
      type: 'number',
      maximum: 20,
      multipleOf: 3.5
    };
    const result = sample(schema);

    result.should.be.eq(17.5);
  });

  it('should correctly sample number with float multipleOf and negative maximum', () => {
    const schema = {
      type: 'number',
      minimum: -10,
      multipleOf: 3.5
    };
    const result = sample(schema);

    result.should.be.eq(-7);
  });

  it('should correctly sample number with float multipleOf, minimum, and maximum', () => {
    const schema = {
      type: 'number',
      minimum: 10,
      maximum: 15,
      multipleOf: 3.5
    };
    const result = sample(schema);

    result.should.be.eq(10.5);
  });

  it('should raise an exception in case of invalid boundaries', () => {
    const schema = {
      type: 'number',
      minimum: 5,
      maximum: 3
    };
    const result = () => sample(schema);

    result.should.throw('Cannot sample numeric by boundaries: 5 <= x <= 3');
  });

  it('should raise an exception in case of invalid integer exclusive boundaries', () => {
    const schema = {
      type: 'integer',
      minimum: 42,
      exclusiveMinimum: true,
      maximum: 43,
      exclusiveMaximum: true
    };
    const result = () => sample(schema);

    result.should.throw('Cannot sample numeric by boundaries: 42 < x < 43');
  });

  it('should raise an exception in case of invalid boundaries with multipleOf', () => {
    const schema = {
      type: 'number',
      minimum: 5,
      exclusiveMinimum: true,
      maximum: 13,
      multipleOf: 15
    };
    const result = () => sample(schema);

    result.should.throw(
      'Cannot sample numeric by boundaries: 5 < x <= 13, multipleOf: 15'
    );
  });
});
