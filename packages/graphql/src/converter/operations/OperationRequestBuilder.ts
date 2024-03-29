import { type Operation } from './Operations';
import { type PostData, type Request } from '@har-sdk/core';
// eslint-disable-next-line @typescript-eslint/naming-convention
import FormData from 'form-data';

export class OperationRequestBuilder {
  private readonly APPLICATION_JSON = 'application/json';
  private readonly MULTIPART_FORM_DATA = 'multipart/form-data';
  private readonly BOUNDARY = '956888039105887155673143';
  private readonly CONTENT_TYPE = 'content-type';

  public build({
    url,
    operation
  }: {
    url: string;
    operation: Operation;
  }): Request {
    return operation.files?.length
      ? this.buildMultipart({ url, operation })
      : this.buildJson({ url, operation });
  }

  public buildJson({
    url,
    operation
  }: {
    url: string;
    operation: Operation;
  }): Request {
    return {
      url,
      method: 'POST',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: [
        {
          name: this.CONTENT_TYPE,
          value: this.APPLICATION_JSON
        }
      ],
      queryString: [],
      headersSize: -1,
      bodySize: -1,
      postData: {
        mimeType: this.APPLICATION_JSON,
        text: this.stringify(operation)
      }
    };
  }

  private buildMultipart({
    url,
    operation
  }: {
    url: string;
    operation: Operation;
  }): Request {
    const { files } = operation;
    const body = new FormData({});
    body.setBoundary(this.BOUNDARY);

    body.append('operations', this.stringify(operation));

    const map = Object.fromEntries(
      files.map((file, index) => [index, [file.pointer]])
    );

    body.append('map', JSON.stringify(map));

    files.forEach((file, index) => {
      body.append(index.toString(), file.content, {
        contentType: file.contentType,
        filename: file.fileName
      });
    });

    const mimeType = `${
      this.MULTIPART_FORM_DATA
    }; boundary=${body.getBoundary()}`;

    const postData: PostData & { _base64EncodedText: string } = {
      mimeType,
      text: body.getBuffer().toString(),
      _base64EncodedText: body.getBuffer().toString('base64')
    };

    return {
      url,
      postData,
      method: 'POST',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: [
        {
          name: 'content-type',
          value: mimeType
        }
      ],
      queryString: [],
      headersSize: -1,
      bodySize: -1
    };
  }

  private stringify({ operationName, query, variables }: Operation): string {
    const operation = {
      ...(operationName ? { operationName } : {}),
      ...(query ? { query } : {}),
      ...(variables ? { variables } : {})
    };

    return JSON.stringify(operation);
  }
}
