import { ParametersParser } from '../ParametersParser';
import {
  SpecTreeNodeParam,
  SpecTreeRequestBodyParam,
  SpecTreeLocationParam,
  ParamLocation
} from '../../models';
import { PostmanHeadersParser } from './PostmanHeadersParser';
import { Postman } from '@har-sdk/core';
import jsonPointer from 'json-pointer';

export class PostmanBodyParser implements ParametersParser {
  constructor(private readonly doc: Postman.Document) {}

  public parse(pointer: string): SpecTreeNodeParam[] {
    const body: Postman.RequestBody = jsonPointer.has(this.doc, pointer)
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    if (!body) {
      return undefined;
    }

    switch (body.mode) {
      case 'raw':
        return [this.createRequestBodyParam(`${pointer}/raw`)];
      case 'file':
        return [this.createRequestBodyParam(`${pointer}/file`)];
      case 'graphql':
        return [this.createRequestBodyParam(`${pointer}/graphql`)];
      case 'urlencoded':
        return this.createBodyLocationParams(
          `${pointer}/urlencoded`,
          body.urlencoded as Postman.QueryParam[]
        );
      case 'formdata':
        return this.createBodyLocationParams(
          `${pointer}/formdata`,
          body.formdata
        );
    }
  }

  private createRequestBodyParam(
    pointer: string,
    contentType?: string
  ): SpecTreeRequestBodyParam {
    const value = jsonPointer.get(this.doc, pointer);

    const headersPointer = jsonPointer.compile([
      ...jsonPointer.parse(pointer).slice(0, -2),
      'header'
    ]);
    const headers = new PostmanHeadersParser(this.doc).parse(headersPointer);
    const bodyType =
      contentType ||
      headers.find((header) => header.key.toLowerCase() === 'content-type')
        ?.value ||
      'application/json';

    return {
      bodyType,
      value,
      paramType: 'requestBody',
      valueJsonPointer: pointer
    };
  }

  private createBodyLocationParams(
    paramsJsonPointer: string,
    params: Postman.QueryParam[] | Postman.FormParam[]
  ): SpecTreeLocationParam[] {
    return params.map((param, idx) => ({
      paramType: 'location',
      location: ParamLocation.BODY,
      valueJsonPointer: `${paramsJsonPointer}/${idx}/value`,
      name: param.key,
      value: param.value
    }));
  }
}
