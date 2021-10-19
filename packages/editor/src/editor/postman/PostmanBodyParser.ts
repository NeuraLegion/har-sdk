import { ParametersParser } from '../ParametersParser';
import {
  SpecTreeNodeParam,
  SpecTreeRequestBodyParam,
  SpecTreeLocationParam,
  ParamLocation
} from '../../models';
import { PostmanHeadersParser } from './PostmanHeadersParser';
import { Postman } from '@har-sdk/types';
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
        return this.parseRawBody(pointer, body);
      case 'file':
        return this.parseFileBody(pointer, body);
      case 'graphql':
        return this.parseGraphQlBody(pointer, body);
      case 'urlencoded':
        return this.parseUrlEncodedBody(pointer, body);
      case 'formdata':
        return this.parseFormDataBody(pointer, body);
      default:
        throw new Error('Unknown Postman request body mode');
    }
  }

  private parseRawBody(
    pointer: string,
    body: Postman.RequestBody
  ): SpecTreeRequestBodyParam[] {
    const headersPointer = jsonPointer.compile([
      ...jsonPointer.parse(pointer).slice(0, -1),
      'header'
    ]);
    const headers = new PostmanHeadersParser(this.doc).parse(headersPointer);
    const contentType =
      headers.find((header) => header.key.toLowerCase() === 'content-type')
        ?.value || 'application/json';

    return [
      {
        paramType: 'requestBody',
        bodyType: contentType,
        value: body.raw,
        valueJsonPointer: `${pointer}/raw`
      }
    ];
  }

  private parseFileBody(
    pointer: string,
    body: Postman.RequestBody
  ): SpecTreeRequestBodyParam[] {
    return [
      {
        paramType: 'requestBody',
        bodyType: 'application/octet-stream',
        value: body.file,
        valueJsonPointer: `${pointer}/file`
      }
    ];
  }

  private parseGraphQlBody(
    pointer: string,
    body: Postman.RequestBody
  ): SpecTreeRequestBodyParam[] {
    return [
      {
        paramType: 'requestBody',
        bodyType: 'application/json',
        value: body.graphql,
        valueJsonPointer: `${pointer}/graphql`
      }
    ];
  }

  private parseUrlEncodedBody(
    pointer: string,
    body: Postman.RequestBody
  ): SpecTreeLocationParam[] | SpecTreeRequestBodyParam[] {
    if (Array.isArray(body.urlencoded)) {
      return body.urlencoded.map(
        (param: Postman.QueryParam, idx: number): SpecTreeLocationParam => ({
          paramType: 'location',
          location: ParamLocation.BODY,
          valueJsonPointer: `${pointer}/urlencoded/${idx}/value`,
          name: param.name,
          value: param.value
        })
      );
    }

    return [
      {
        paramType: 'requestBody',
        bodyType: 'application/x-www-form-urlencoded',
        value: body.urlencoded,
        valueJsonPointer: `${pointer}/urlencoded`
      }
    ];
  }

  private parseFormDataBody(
    pointer: string,
    body: Postman.RequestBody
  ): SpecTreeLocationParam[] {
    return body.formdata.map(
      (param: Postman.FormParam, idx: number): SpecTreeLocationParam => ({
        paramType: 'location',
        location: ParamLocation.BODY,
        valueJsonPointer: `${pointer}/formdata/${idx}/value`,
        name: param.name,
        value: param.value
      })
    );
  }
}
