import 'chai/register-should';
import { first } from '../src/utils';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { promisify } from 'util';

use(chaiAsPromised);

describe('first', () => {
  it('should be resolved with an undefined if all resolved promises does not pass the test.', async () => {
    // arrange
    const input = [
      Promise.resolve(1),
      promisify(setTimeout)(100).then(() => 2),
      promisify(setTimeout)(200).then(() => 3)
    ];
    const predicate = (x: number) => x > 5;

    // act
    const result = await first(input, predicate);

    // assert
    (typeof result).should.eq('undefined');
  });

  it('should be resolved with the result of first resolved promise that pass the test', async () => {
    // arrange
    const input = [
      promisify(setTimeout)(0).then(() => 1),
      promisify(setTimeout)(500).then(() => 2),
      promisify(setTimeout)(5000).then(() => 3)
    ];
    const predicate = (x: number) => x >= 2;

    // act
    const result = await first(input, predicate);

    // assert
    result.should.eq(2);
  });

  it('should be resolved with an undefined if no promises', async () => {
    // arrange
    const predicate = (x: number) => x >= 2;

    // act
    const result = await first([], predicate);

    // assert
    (typeof result).should.eq('undefined');
  });

  it('should be rejected with an error if at least one of the promises is rejected', async () => {
    // arrange
    const expected = 'Something went wrong';
    const input = [
      Promise.reject(new Error(expected)),
      promisify(setTimeout)(0).then(() => 1),
      promisify(setTimeout)(100).then(() => 2)
    ];
    const predicate = (x: number) => x >= 2;

    // act
    const result = first(input, predicate);

    // assert
    return result.should.be.rejectedWith(Error, expected);
  });
});
