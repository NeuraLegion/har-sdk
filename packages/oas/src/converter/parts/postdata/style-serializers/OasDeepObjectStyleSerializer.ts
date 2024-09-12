import {
  OasStyleSerializer,
  type OasStyleSerializerData,
  type OasStyleSerializerOptions,
  OasStyleSerializerType
} from './OasStyleSerializer';
import { isPrimitive } from '../../../../utils/isPrimitive';
import { UriTemplator } from '../../UriTemplator';
import { decodeReserved } from '../../../../utils/decodeReserved';

export class OasDeepObjectStyleSerializer implements OasStyleSerializer {
  public supportsStyle(style: OasStyleSerializerType): boolean {
    return OasStyleSerializerType.DEEP_OBJECT === style;
  }

  public serialize(
    { key, value }: OasStyleSerializerData,
    { style, explode, allowReserved }: OasStyleSerializerOptions
  ): string {
    if (!this.supportsStyle(style) || !this.shouldSerialize(value, explode)) {
      return '';
    }

    const result = Object.entries(value).reduce(
      (acc, [prop, val]: [string, unknown]) => {
        const keyValue = new UriTemplator()
          .substitute(`?${key}[${prop}]={val}`, {
            val: val ?? ''
          })
          .substring(1);

        if (keyValue.length) {
          const prefix = acc ? `${acc}&` : '';

          return `${prefix}${keyValue}`;
        }

        return acc;
      },
      ''
    );

    return allowReserved ? decodeReserved(result) : result;
  }

  private shouldSerialize(value: unknown, explode: boolean): value is object {
    return !!value && explode && !Array.isArray(value) && !isPrimitive(value);
  }
}
