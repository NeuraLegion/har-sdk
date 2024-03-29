import { InputSampler, type InputSamplerOptions } from './InputSampler';
import { ScalarSampler } from './ScalarSampler';
import {
  type IntrospectionInputTypeRef,
  type IntrospectionNamedTypeRef,
  type IntrospectionScalarType
} from '@har-sdk/core';

interface UploadSample {
  name: string;
  extension: string;
  contentType: string;
  content: string;
}

export class UploadScalarSampler implements InputSampler {
  // Upload scalar type names borrowed from GraphQL multipart request specification:
  // https://github.com/jaydenseric/graphql-multipart-request-spec
  // File from 'graphql-yoga' project:
  // https://the-guild.dev/graphql/yoga-server/docs/features/file-uploads
  private readonly UPLOAD_SCALAR_NAMES: readonly string[] = ['Upload', 'File'];

  private readonly IMAGE_FILE = {
    name: 'image',
    extension: '.png',
    content: '\x89\x50\x4e\x47\x0d\x0A\x1a\x0a',
    contentType: 'image/png'
  } as const;

  private readonly BLOB_FILE = {
    name: 'blob',
    extension: '.bin',
    content: '\x01\x02\x03\x04\x05',
    contentType: 'application/octet-stream'
  } as const;

  private readonly IMAGE_KEYWORDS: readonly string[] = [
    'avatar',
    'profile',
    'img',
    'image',
    'pic',
    'bio',
    'photo',
    'shot',
    'gallery',
    'art',
    'pano',
    'paint',
    'draw',
    'view',
    'banner'
  ];

  constructor(
    private readonly scalarSampler: ScalarSampler = new ScalarSampler()
  ) {}

  public supportsType(
    typeRef: IntrospectionInputTypeRef
  ): typeRef is IntrospectionNamedTypeRef<IntrospectionScalarType> {
    return this.scalarSampler.supportsType(typeRef);
  }

  public sample(
    typeRef: IntrospectionInputTypeRef,
    options: InputSamplerOptions
  ): string | undefined {
    if (
      !this.supportsType(typeRef) ||
      !this.UPLOAD_SCALAR_NAMES.includes(typeRef.name)
    ) {
      return this.scalarSampler.sample(typeRef, options);
    }

    const { pointer, files } = options;

    const file = this.findSample([...pointer]);

    files.push({
      pointer: pointer.join('.'),
      fileName: `${file.name}${files.length > 0 ? files.length : ''}${
        file.extension
      }`,
      contentType: file.contentType,
      content: file.content
    });

    return 'null';
  }

  private findSample(names: string[]): UploadSample {
    const name = names.pop();

    if (name === undefined) {
      return this.BLOB_FILE;
    }

    if (
      this.IMAGE_KEYWORDS.some((keyword) =>
        name.toLowerCase().includes(keyword)
      )
    ) {
      return this.IMAGE_FILE;
    }

    return this.findSample(names);
  }
}
