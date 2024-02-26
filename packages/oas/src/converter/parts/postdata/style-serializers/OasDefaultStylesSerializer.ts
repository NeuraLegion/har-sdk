import {
  OasStyleSerializer,
  type OasStyleSerializerData,
  type OasStyleSerializerOptions,
  OasStyleSerializerType
} from './OasStyleSerializer';
import { isArrayOfPrimitives } from '../../../../utils/isArrayOfPrimitives';
import { UriTemplator } from '../../UriTemplator';
import { decodeReserved } from '../../../../utils/decodeReserved';

export class OasDefaultStylesSerializer implements OasStyleSerializer {
  private readonly CUSTOM_DELIMITERS: ReadonlyMap<
    OasStyleSerializerType,
    string
  > = new Map<OasStyleSerializerType, string>([
    [OasStyleSerializerType.PIPE_DELIMITED, '|'],
    [OasStyleSerializerType.SPACE_DELIMITED, '%20']
  ]);

  public supportsStyle(style: OasStyleSerializerType): boolean {
    return [
      OasStyleSerializerType.PIPE_DELIMITED,
      OasStyleSerializerType.SPACE_DELIMITED,
      OasStyleSerializerType.FORM
    ].includes(style);
  }

  public serialize(
    { key, value }: OasStyleSerializerData,
    { explode, allowReserved, style }: OasStyleSerializerOptions
  ): string {
    if (
      !this.supportsStyle(style) ||
      this.isNonArrayValueForArrayStyle(style, value)
    ) {
      return '';
    }

    const template = this.getTemplateString(key, explode, style);

    let result = new UriTemplator()
      .substitute(template, {
        [key]: value
      })
      .substring(1);

    result = this.replaceDelimiter(style, result);

    return allowReserved ? decodeReserved(result) : result;
  }

  private isNonArrayValueForArrayStyle(
    style: OasStyleSerializerType,
    value: unknown
  ) {
    return (
      [
        OasStyleSerializerType.PIPE_DELIMITED,
        OasStyleSerializerType.SPACE_DELIMITED
      ].includes(style) && !isArrayOfPrimitives(value)
    );
  }

  private replaceDelimiter(style: OasStyleSerializerType, result: string) {
    const customDelimiter = this.CUSTOM_DELIMITERS.get(style);

    return customDelimiter ? result.replace(/,/g, customDelimiter) : result;
  }

  private getTemplateString(
    key: string,
    explode: boolean,
    style?: OasStyleSerializerType
  ) {
    const suffix = explode && style === OasStyleSerializerType.FORM ? '*' : '';

    return `{?${key}${suffix}}`;
  }
}
