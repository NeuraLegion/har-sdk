import { SubConverter } from '../SubConverter';
import { SubPart } from '../SubPart';
import { SubConverterFactory } from './SubConverterFactory';
import { OpenAPI } from '@har-sdk/core';

export class SubConverterRegistry {
  private readonly subConverters = new Map<SubPart, SubConverter<unknown>>();

  constructor(private readonly subConverterFactory: SubConverterFactory) {}

  public get(spec: OpenAPI.Document, type: SubPart): SubConverter<unknown> {
    if (!this.subConverters.has(type)) {
      this.subConverters.set(
        type,
        this.subConverterFactory.createSubConverter(spec, type)
      );
    }

    return this.subConverters.get(type);
  }
}
