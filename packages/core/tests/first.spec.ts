describe('first', () => {
  it('should be resolved with an undefined if all promises are rejected');
  it('should be resolved with the result of first resolved promise');
  it('should be resolved with an undefined if no promises');
  it(
    'should be rejected with an error if at least one of the promises is rejected'
  );
});
