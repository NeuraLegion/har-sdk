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
    bodyType: string,
    mediaTypeObject: OpenAPIV3.MediaTypeObject
  ): SpecTreeRequestBodyParam {
    const mediaTypePointer = `${pointer}${jsonPointer.compile([
      'content',
      bodyType
    ])}`;
    const value = this.getBodyExampleValue(mediaTypePointer, mediaTypeObject);
    const valueJsonPointer = `${mediaTypePointer}${
      value != null ? this.getBodyValueJsonPointer(mediaTypeObject) : '/example'
    }`;

    return {
      ...(value != null ? { value } : {}),
      bodyType,
      valueJsonPointer,
      paramType: 'requestBody'
    };
  }

  private getBodyExampleValue(
    mediaTypePointer: string,
    mediaTypeObject: OpenAPIV3.MediaTypeObject
  ): unknown {
    const { example, examples = {} } = mediaTypeObject;
    const exampleName = this.getExampleName(mediaTypeObject);
    const exampleObject = exampleName
      ? this.dereferenceIfNecessary(
          `${mediaTypePointer}${jsonPointer.compile([
            'examples',
            exampleName
          ])}`,
          examples[exampleName]
        )
      : undefined;

    return (
      exampleObject?.value ??
      example ??
      this.getSchemaExampleValue(mediaTypePointer, mediaTypeObject.schema)
    );
  }

  private getBodyValueJsonPointer(
    mediaTypeObject: OpenAPIV3.MediaTypeObject
  ): string {
    const exampleName = this.getExampleName(mediaTypeObject);

    let segments: string[];

    if (exampleName) {
      segments = ['examples', exampleName, 'value'];
    } else if (mediaTypeObject.example != null) {
      segments = ['example'];
    } else {
      segments = ['schema', 'example'];
    }

    return jsonPointer.compile(segments);
  }

  private getSchemaExampleValue(
    mediaTypePointer: string,
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
  ): unknown {
    return this.dereferenceIfNecessary(`${mediaTypePointer}/schema`, schema)
      .example;
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
