import { first } from '../src/utils';
import { promisify } from 'util';

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
    expect(result).toBeUndefined();
  });

  it('should be resolved with the result of first resolved promise that pass the test', async () => {
    // arrange
    const input = [
      promisify(setTimeout)(0).then(() => 1),
      promisify(setTimeout)(500).then(() => 2),
      promisify(setTimeout)(1000).then(() => 3)
    ];
    const predicate = (x: number) => x >= 2;

    // act
    const result = await first(input, predicate);

    // assert
    expect(result).toEqual(2);
  });

  it('should be resolved with an undefined if no promises', async () => {
    // arrange
    const predicate = (x: number) => x >= 2;

    // act
    const result = await first([], predicate);

    // assert
    expect(result).toBeUndefined();
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
    await expect(result).rejects.toThrowError(expected);
  });
});
