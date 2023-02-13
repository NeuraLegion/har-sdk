import { Sampler } from '../Sampler';
import { isOASV2 } from '../../../utils';
import { SubConverter } from '../../SubConverter';
import { OpenAPI, PostData } from '@har-sdk/core';
import pointer from 'json-pointer';
import { toXML } from 'jstoxml';
import { stringify } from 'qs';

export class PostDataConverter implements SubConverter<PostData | null> {
  private readonly JPG_IMAGE = '/9j/2w==';
  private readonly PNG_IMAGE = 'iVBORw0KGgo=';
  private readonly BOUNDARY = '956888039105887155673143';
  private readonly BASE64_PATTERN =
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  // eslint-disable-next-line complexity
  public convert(path: string, method: string): PostData | null {
    const pathObj = this.spec.paths[path][method];
    const tokens = ['paths', path, method];
    const params = Array.isArray(pathObj.parameters) ? pathObj.parameters : [];

    for (const param of params) {
      if (
        typeof param.in === 'string' &&
        param.in.toLowerCase() === 'body' &&
        'schema' in param
      ) {
        const data = this.sampler.sampleParam(param, {
          tokens,
          spec: this.spec,
          idx: pathObj.parameters.indexOf(param)
        });

        let consumes;

        // eslint-disable-next-line max-depth
        if (pathObj.consumes?.length) {
          consumes = pathObj.consumes;
        } else if (isOASV2(this.spec) && this.spec.consumes?.length) {
          consumes = this.spec.consumes;
        }

        const paramContentType = this.sampler.sample({
          type: 'array',
          examples: consumes || ['application/json']
        });

        return this.encodePayload(data, paramContentType);
      }
    }

    const content = pathObj.requestBody?.content ?? {};
    const keys = Object.keys(content);

    if (!keys.length) {
      return null;
    }

    const contentType = this.sampler.sample({
      type: 'array',
      examples: keys
    });
    const sampleContent = content[contentType];

    if (sampleContent?.schema) {
      const data = this.sampler.sample(
        {
          ...sampleContent.schema,
          ...(sampleContent.example !== undefined
            ? { example: sampleContent.example }
            : {})
        },
        {
          spec: this.spec,
          jsonPointer: pointer.compile([
            ...tokens,
            'requestBody',
            'content',
            contentType,
            'schema'
          ])
        }
      );

      return this.encodePayload(data, contentType, sampleContent.encoding);
    }

    return null;
  }

  private encodePayload(
    data: any,
    contentType: string,
    encoding?: any
  ): { mimeType: string; text: string } {
    let encodedData = data;

    if (encoding) {
      encodedData = this.encodeProperties(
        Object.keys(encoding),
        data,
        encoding
      );
    }

    return {
      mimeType: contentType.includes('multipart')
        ? `${contentType}; boundary=${this.BOUNDARY}`
        : contentType,
      text: this.encodeValue(encodedData, contentType, encoding)
    };
  }

  // eslint-disable-next-line complexity
  private encodeValue(value: any, contentType: string, encoding?: any): string {
    switch (contentType) {
      case 'application/json':
        return typeof value === 'string' ? value : JSON.stringify(value);

      case 'application/x-www-form-urlencoded':
        return stringify(value, {
          format: 'RFC3986',
          encode: false
        });

      case 'application/xml':
        // eslint-disable-next-line no-case-declarations
        const xmlOptions = {
          header: true,
          indent: '  '
        };

        return toXML(value, xmlOptions);

      case 'multipart/form-data':
      case 'multipart/mixin':
        // eslint-disable-next-line no-case-declarations
        const EOL = '\r\n';

        // eslint-disable-next-line no-case-declarations
        let rawData = Object.keys(value || {})
          .reduce((params: string[], key: string) => {
            const multipartContentType = this.getMultipartContentType(
              value[key],
              key,
              encoding
            );

            let param = `--${this.BOUNDARY}${EOL}`;

            switch (multipartContentType) {
              case 'text/plain':
                param += `Content-Disposition: form-data; name="${key}"${
                  EOL + EOL
                }`;
                break;
              case 'application/json':
                param += `Content-Disposition: form-data; name="${key}"${EOL}`;
                param += `Content-Type: ${multipartContentType}${EOL + EOL}`;
                break;
              default: {
                param += `Content-Disposition: form-data; name="${key}"; filename="${key}"${EOL}`;
                param += `Content-Type: ${multipartContentType}${EOL}`;
                param += `Content-Transfer-Encoding: base64${EOL + EOL}`;
              }
            }

            param +=
              typeof value[key] === 'object'
                ? JSON.stringify(value[key])
                : value[key];

            params.push(param);

            return params;
          }, [] as string[])
          .join(EOL);

        rawData += EOL;
        rawData += `--${this.BOUNDARY}--`;

        return rawData;

      case 'image/jpg':
      case 'image/jpeg':
        return this.JPG_IMAGE;

      case 'image/png':
      case 'image/*':
        return this.PNG_IMAGE;

      default:
        return typeof value === 'object' ? JSON.stringify(value) : value;
    }
  }

  private getMultipartContentType(
    value: any,
    paramKey: string,
    encoding: any
  ): string {
    if (encoding && encoding[paramKey] && encoding[paramKey].contentType) {
      return encoding[paramKey].contentType;
    }

    switch (typeof value) {
      case 'object':
        return 'application/json';
      case 'string':
        return this.BASE64_PATTERN.test(value)
          ? 'application/octet-stream'
          : 'text/plain';
      case 'number':
      case 'boolean':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  private encodeProperties(keys: string[], data: any, encoding: any): string {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const encodedSample = keys.reduce((encodedSample, encodingKey) => {
      encodedSample[encodingKey] = this.encodeValue(
        data[encodingKey],
        encoding[encodingKey].contentType
      );

      return encodedSample;
    }, {});

    return Object.assign({}, data, encodedSample);
  }
}
