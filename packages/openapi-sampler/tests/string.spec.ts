import { sample } from '../src';
import 'chai/register-should';

describe('StringSampler', () => {
  it('should sample deterministic email string', () => {
    const schema = {
      type: 'string',
      format: 'email'
    };
    const result = sample(schema);
    result.should.eq('jon.snow@targaryen.com');
  });

  it('should sample deterministic pattern string', () => {
    const schema = {
      type: 'string',
      format: 'pattern',
      pattern: '\\d{1,3}'
    };
    const result = sample(schema);
    result.should.eq('44');
  });

  it('should throw on invalid maxLength pattern constrain', () => {
    const schema = {
      type: 'string',
      format: 'pattern',
      pattern: '\\d{10,20}',
      maxLength: 5
    };

    const result = () => sample(schema);

    result.should.throw(
      /Using maxLength = 5 is incorrect with format "pattern"/
    );
  });

  it('should sample deterministic long password', () => {
    const schema = {
      type: 'string',
      format: 'password',
      minLength: 25
    };
    const result = sample(schema);
    result.should.eq('p@$$w0rdp@$$w0rdp@$$w0rdp');
  });

  it('should sample deterministic short password', () => {
    const schema = {
      type: 'string',
      format: 'password',
      maxLength: 4
    };
    const result = sample(schema);
    result.should.eq('p@$$');
  });

  it('should sample deterministic binary string', () => {
    const schema = {
      type: 'string',
      format: 'binary'
    };
    const result = sample(schema);
    result.should.eq('ZHVtbXkgYmluYXJ5IHNhbXBsZQA=');
  });

  it('should sample deterministic default value for unknown format', () => {
    const schema = {
      type: 'string',
      format: 'dummy'
    };
    const result = sample(schema);
    result.should.eq('lorem');
  });

  it('should sample deterministic date-time string', () => {
    const schema = {
      type: 'string',
      format: 'date-time'
    };
    const result = sample(schema);
    result.should.eq('2021-12-31T23:34:00Z');
  });

  it('should throw on invalid date minLength constrain', () => {
    const schema = {
      type: 'string',
      format: 'date',
      minLength: 11
    };

    const result = () => sample(schema);

    result.should.throw(/Using minLength = 11 is incorrect with format "date"/);
  });
});
