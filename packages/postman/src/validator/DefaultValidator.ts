import { Validator } from './Validator';
import { VersionValidator } from './VersionValidator';
import { SchemaValidator } from './SchemaValidator';
import { Postman } from '../types/postman';

const DEFAULT_VALIDATORS: (VersionValidator | SchemaValidator)[] = [
  new VersionValidator(),
  new SchemaValidator()
];

export class DefaultValidator implements Validator {
  private readonly subValidators: Validator[];

  constructor(...validators: Validator[]) {
    this.subValidators = !validators.length ? DEFAULT_VALIDATORS : validators;
  }

  public async verify(collection: Postman.Collection): Promise<void> {
    await Promise.all(
      this.subValidators.map((x: Validator) => x.verify(collection))
    );
  }
}
