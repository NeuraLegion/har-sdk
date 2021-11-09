import { ParametersParser } from '../../ParametersParser';
import { SpecTreeNodeParam, SpecTreeRequestBodyParam } from '../../../models';
import { OpenAPIV3 } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class OasV3RequestBodyObjectParser implements ParametersParser {
  constructor(
    private readonly doc: OpenAPIV3.Document,
    private readonly dereferencedDoc: OpenAPIV3.Document
  ) {}

  public parse(pointer: string): SpecTreeNodeParam[] {
    let requestBody = jsonPointer.has(this.doc, pointer)
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    if (!requestBody) {
      return undefined;
    }

    if ((requestBody as OpenAPIV3.ReferenceObject).$ref) {
      requestBody = jsonPointer.get(this.dereferencedDoc, pointer);
    }

    const requestContent = (requestBody as OpenAPIV3.RequestBodyObject).content;

    return Object.entries(requestContent).map(
      ([mediaType, mediaTypeObject]: [
        string,
        OpenAPIV3.MediaTypeObject
      ]): SpecTreeRequestBodyParam =>
        this.parseRequestBodyContentEntry(pointer, mediaType, mediaTypeObject)
    );
  }

  private parseRequestBodyContentEntry(
    pointer: string,
    mediaType: string,
    mediaTypeObject: OpenAPIV3.MediaTypeObject
  ): SpecTreeRequestBodyParam {
    const value =
      mediaTypeObject.example ??
      (mediaTypeObject.examples?.[0] as OpenAPIV3.ExampleObject)?.value;

    return {
      paramType: 'requestBody',
      bodyType: mediaType,
      ...(value != null ? { value } : {}),
      valueJsonPointer: `${pointer}${jsonPointer.compile([
        'content',
        mediaType,
        'example'
      ])}`
    };
  }
}
