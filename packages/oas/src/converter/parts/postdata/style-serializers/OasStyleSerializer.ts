export enum OasStyleSerializerType {
  FORM = 'form',
  SPACE_DELIMITED = 'spaceDelimited',
  PIPE_DELIMITED = 'pipeDelimited',
  DEEP_OBJECT = 'deepObject'
}

export interface OasStyleSerializerData {
  key: string;
  value: unknown;
}

export interface OasStyleSerializerOptions {
  explode: boolean;
  allowReserved: boolean;
  style: OasStyleSerializerType;
}

export interface OasStyleSerializer {
  supportsStyle(style: OasStyleSerializerType): boolean;

  serialize(
    serializerData: OasStyleSerializerData,
    serializerOptions: OasStyleSerializerOptions
  ): string;
}
