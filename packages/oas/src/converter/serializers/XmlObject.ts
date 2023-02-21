import type { XmlElement } from 'jstoxml';
import type { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export interface AttributeOptions {
  name: string;
  value: unknown;
  prefix?: string;
}

export class XmlObject {
  private _attrs?: Record<string, unknown>[] = [];
  private _content?: (XmlElement | unknown)[] = [];
  private _plainName?: string;
  private _name?: string;

  get name(): string {
    return this._plainName;
  }

  get wrapping(): boolean {
    return this.schema.wrapped;
  }

  constructor(
    private readonly schema: OpenAPIV3.XMLObject | OpenAPIV2.XMLObject,
    name = 'root'
  ) {
    this.setName(schema.name ?? name, schema.prefix);

    if (schema.namespace) {
      this.addNamespaceDeclaration(schema.namespace, schema.prefix);
    }
  }

  public setName(name: string, prefix?: string): this {
    this._plainName = name;
    this._name = this.getName(name, prefix);

    return this;
  }

  public addNamespaceDeclaration(namespace: string, prefix?: string): this {
    const prefixedName = this.getNamespace(prefix);

    return this.addAttribute(prefixedName, namespace);
  }

  public addAttribute(name: string, value: unknown): this;
  public addAttribute(options: {
    name: string;
    value: unknown;
    prefix?: string;
  }): this;
  public addAttribute(
    nameOrOptions: { name: string; value: unknown; prefix?: string } | string,
    valueOrNothing?: unknown
  ): this {
    const { name, value, prefix } = this.getAttributeOptions(
      nameOrOptions,
      valueOrNothing
    );

    this._attrs.push({ [this.getName(name, prefix)]: value });

    return this;
  }

  public addContent(...elements: (unknown | XmlObject)[]): this {
    this._content.push(
      ...elements.map((x) => (x instanceof XmlObject ? x.build() : x))
    );

    return this;
  }

  public build(): XmlElement {
    return {
      _name: this._name,
      _attrs: [...this._attrs],
      _content: this._content.length === 1 ? this._content[0] : this._content
    };
  }

  private getAttributeOptions(
    nameOrOptions: string | AttributeOptions,
    value?: unknown
  ): AttributeOptions {
    return typeof nameOrOptions === 'string'
      ? {
          value,
          name: nameOrOptions
        }
      : {
          name: nameOrOptions.name,
          value: nameOrOptions.value,
          prefix: nameOrOptions.prefix
        };
  }

  private getName(name: string, prefix?: string) {
    return prefix ? `${prefix}:${name}` : name;
  }

  private getNamespace(prefix?: string): string {
    return `xmlns${prefix ? `:${prefix}` : ''}`;
  }
}
