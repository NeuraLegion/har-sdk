import { Options, Traverse } from '../traverse';
import { Sampler } from './Sampler';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export class ObjectSampler implements Sampler {
  constructor(private readonly traverse: Traverse) {}

  public sample(
    schema: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject,
    spec?: OpenAPIV3.Document & OpenAPIV2.Document,
    options?: Options
  ): Record<string, any> {
    const res: Record<string, any> = {};

    if (schema && typeof schema.properties === 'object') {
      const requiredKeys = Array.isArray(schema.required)
        ? schema.required
        : [];
      const requiredKeyDict: Record<string, any> = requiredKeys.reduce(
        (dict, key) => {
          dict[key] = true;

          return dict;
        },
        {}
      );

      Object.keys(schema.properties).forEach((propertyName) => {
        // skip before traverse that could be costly
        if (
          options.skipNonRequired &&
          // eslint-disable-next-line no-prototype-builtins
          !requiredKeyDict.hasOwnProperty(propertyName)
        ) {
          return;
        }

        const sample = this.traverse.traverse(
          schema.properties[propertyName],
          options,
          spec
        );
        if (options.skipReadOnly && sample.readOnly) {
          return;
        }

        if (options.skipWriteOnly && sample.writeOnly) {
          return;
        }
        res[propertyName] = sample.value;
      });
    }

    if (schema && typeof schema.additionalProperties === 'object') {
      res.property1 = this.traverse.traverse(
        schema.additionalProperties,
        options,
        spec
      ).value;
      res.property2 = this.traverse.traverse(
        schema.additionalProperties,
        options,
        spec
      ).value;
    }

    return res;
  }
}
