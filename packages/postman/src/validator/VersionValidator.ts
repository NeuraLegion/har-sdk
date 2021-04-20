import { Validator } from './Validator';
import { Postman } from '../types/postman';
import semver from 'semver';
import { ok } from 'assert';

export class VersionValidator implements Validator {
  private readonly MIN_ALLOWED_VERSION = '2.0.0';

  public async verify(collection: Postman.Collection): Promise<void> {
    ok(collection, 'Postman collection is not provided.');
    ok(collection.info, '"info" section is missed in the collection.');

    if (collection.info.version) {
      const { version: versionObject } = collection.info;

      const version: string =
        typeof versionObject === 'string'
          ? versionObject
          : `${versionObject.major}.${versionObject.minor}.${versionObject.patch}`;

      if (!semver.gte(version, this.MIN_ALLOWED_VERSION)) {
        throw new Error(
          'Postman v1 collections are not supported. If you are using an older format, convert it to v2 and try again.'
        );
      }
    }
  }
}
