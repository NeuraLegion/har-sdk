import { ParametersParser } from '../../ParametersParser';
import { SpecTreeNodeParam, SpecTreeRequestBodyParam } from '../../../models';
import { OpenAPIV3 } from '@har-sdk/core';
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
    const mediaTypePointer = this.getMediaTypePointer(pointer, mediaType);
    const schema = this.dereferenceIfNecessary(
      this.getBodySchemaPointer(mediaTypePointer),
      mediaTypeObject.schema
    );
    const value = this.getBodyValue(mediaTypePointer, mediaTypeObject, schema);

    return {
      paramType: 'requestBody',
      bodyType: mediaType,
      ...(value != null ? { value } : {}),
      valueJsonPointer: `${mediaTypePointer}${
        value != null
          ? this.getBodyValueJsonPointer(mediaTypeObject)
          : '/example'
      }`
    };
  }

  private getBodySchemaPointer(mediaTypePointer: string): string {
    return `${mediaTypePointer}/schema`;
  }

  private getMediaTypePointer(
    requestPointer: string,
    mediaType: string
  ): string {
    return `${requestPointer}${jsonPointer.compile(['content', mediaType])}`;
  }

  private getExampleObjectPointer(
    mediaTypePointer: string,
    exampleName: string
  ): string {
    return `${mediaTypePointer}${jsonPointer.compile([
      'examples',
      exampleName
    ])}`;
  }

  private getBodyValueJsonPointer(
    mediaTypeObject: OpenAPIV3.MediaTypeObject
  ): string {
    const exampleName = this.getExampleName(mediaTypeObject);
    const segments = exampleName
      ? ['examples', exampleName, 'value']
      : mediaTypeObject.example != null
      ? ['example']
      : ['schema', 'example'];

    return jsonPointer.compile(segments);
  }

  private getBodyValue(
    mediaTypePointer: string,
    mediaTypeObject: OpenAPIV3.MediaTypeObject,
    schema: OpenAPIV3.SchemaObject
  ): unknown {
    const exampleName = this.getExampleName(mediaTypeObject);
    const { examples, example } = mediaTypeObject;

    const exampleObject = exampleName
      ? this.dereferenceIfNecessary(
          this.getExampleObjectPointer(mediaTypePointer, exampleName),
          (examples ?? {})[exampleName]
        )
      : undefined;

    return exampleObject?.value ?? example ?? schema.example;
  }

  private getExampleName(
    mediaTypeObject: OpenAPIV3.MediaTypeObject
  ): string | undefined {
    return Object.keys(mediaTypeObject.examples ?? {})[0];
  }

  private dereferenceIfNecessary<
    T extends OpenAPIV3.SchemaObject | OpenAPIV3.ExampleObject
  >(pointer: string, schema: T | OpenAPIV3.ReferenceObject): T {
    return '$ref' in schema
      ? jsonPointer.get(this.dereferencedDoc, pointer)
      : schema;
  }
}
