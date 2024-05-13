import {
  OasStyleSerializer,
  OasStyleSerializerType
} from '../style-serializers/OasStyleSerializer';
import { isObject } from '../../../../utils';
import { isPrimitive } from '../../../../utils/isPrimitive';
import { isArrayOfPrimitives } from '../../../../utils/isArrayOfPrimitives';
import { OasDeepObjectStyleSerializer } from '../style-serializers/OasDeepObjectStyleSerializer';
import { OasDefaultStylesSerializer } from '../style-serializers/OasDefaultStylesSerializer';
import { OpenAPIV2, type OpenAPIV3 } from '@har-sdk/core';

export class FormUrlEncodedMediaTypeEncoder {
  constructor(
    private readonly oasStyleSerializers: OasStyleSerializer[] = [
      new OasDeepObjectStyleSerializer(),
      new OasDefaultStylesSerializer()
    ]
  ) {}

  public encode(encodingData: {
    value: unknown;
    fields?: Record<string, OpenAPIV3.EncodingObject>;
    schema?: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject;
  }): string {
    const { value, fields } = encodingData;

    if (!isObject(value) || Array.isArray(value)) {
      return '';
    }

    const entries = Object.entries(value)
      .map(([key, val]: [string, unknown]) => {
        const serializationParams = this.getSerializationParams(
          (fields ? fields[key] : undefined) ?? {}
        );

        const { style, explode, allowReserved } = serializationParams;

        const stringifyObject =
          style === OasStyleSerializerType.FORM &&
          !(isPrimitive(val) || isArrayOfPrimitives(val));

        return this.findSerializer(style)?.serialize(
          {
            key,
            value: stringifyObject ? JSON.stringify(val) : val
          },
          { allowReserved, explode, style }
        );
      })
      .filter(Boolean);

    return entries.join('&');
  }

  private findSerializer(style: OasStyleSerializerType) {
    return this.oasStyleSerializers
      .filter((x) => x.supportsStyle(style))
      .shift();
  }

  private getSerializationParams(encodingObject: OpenAPIV3.EncodingObject) {
    const [encodingObjectStyle]: OasStyleSerializerType[] = Object.values(
      OasStyleSerializerType
    ).filter((x) => x === encodingObject.style);

    const style = encodingObjectStyle ?? OasStyleSerializerType.FORM;

    return {
      style,
      explode: encodingObject.explode ?? false,
      allowReserved: encodingObject.allowReserved ?? false,
      contentType: encodingObject.contentType
    };
  }
}
