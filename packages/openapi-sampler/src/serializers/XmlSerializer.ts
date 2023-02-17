import { Serializer } from './Serializer';
import { OpenAPISchema } from '../samplers';
import { toXML, XmlElement } from 'jstoxml';
import { OpenAPIV3 } from '@har-sdk/core';

export class XmlSerializer implements Serializer {
  public serialize(data: unknown, schema: OpenAPISchema): string {
    const xmlElements = this.convertToXmlElement(data, schema);

    return toXML(xmlElements, {
      header: true,
      indent: '\t'
    });
  }

  public convertToXmlElement(
    data: unknown,
    schema: OpenAPISchema
  ): XmlElement | XmlElement[] {
    const { type, properties, xml = { name: 'root' } } = schema;
    const { prefix, wrapped, name } = xml;

    const elementName = this.getName(name, prefix);
    const element = this.createElement(elementName);

    if (type === 'object') {
      const { attributes, children } = this.convertObjectToXmlElement(
        properties as Record<string, OpenAPIV3.SchemaObject>,
        xml,
        data
      );

      element._attrs = attributes;
      element._content = children;

      return element;
    } else if (type === 'array' && Array.isArray(data)) {
      const children = this.convertArrayToXmlElement(
        schema as OpenAPIV3.ArraySchemaObject,
        xml,
        data
      );

      if (!wrapped) {
        return children;
      } else {
        element._content = children;

        return element;
      }
    } else {
      element._content = data;

      return element;
    }
  }

  private convertObjectToXmlElement(
    properties: Record<string, OpenAPIV3.SchemaObject>,
    xml: OpenAPIV3.XMLObject,
    data: unknown
  ): { children: XmlElement[]; attributes: Record<string, unknown>[] } {
    const attributes: Record<string, unknown>[] = [];
    const children: XmlElement[] = [];

    if (xml.namespace) {
      attributes.push(this.createNamespaceAttribute(xml.namespace, xml.prefix));
    }

    Object.entries(properties).forEach(
      ([key, subSchema]: [string, OpenAPISchema]) => {
        const value = data ? data[key] : undefined;
        const subXml = {
          ...subSchema?.xml,
          name: subSchema?.xml?.name ?? key
        };

        if (subXml.attribute) {
          attributes.push(
            this.createAttribute(
              this.getName(subXml.name, subXml.prefix),
              value
            )
          );
        } else {
          const property = this.convertToXmlElement(value, {
            ...subSchema,
            xml: subXml
          });

          children.push(...[].concat(property));
        }
      }
    );

    return { attributes, children };
  }

  private convertArrayToXmlElement(
    schema: OpenAPIV3.ArraySchemaObject,
    xml: OpenAPIV3.XMLObject,
    data: unknown[]
  ): XmlElement | XmlElement[] {
    const { items } = schema;
    const itemsXml = 'xml' in items ? items.xml : {};
    const subXml = {
      ...itemsXml,
      name: itemsXml.name ?? xml.name
    };

    return data.map(
      (item) =>
        this.convertToXmlElement(item, {
          ...items,
          xml: subXml
        }) as XmlElement
    );
  }

  private createAttribute(
    name: string,
    value: unknown
  ): Record<string, unknown> {
    return { [name]: value };
  }

  private createNamespaceAttribute(
    namespace: string,
    prefix?: string
  ): Record<string, unknown> {
    const attributeName = this.getNamespace(prefix);

    return this.createAttribute(attributeName, namespace);
  }

  private createElement(
    name: string,
    attributes: Record<string, unknown>[] = [],
    children: XmlElement[] | XmlElement | unknown = []
  ): XmlElement {
    return {
      _name: name,
      _attrs: attributes,
      _content: children
    };
  }

  private getNamespace(prefix?: string) {
    return `xmlns${prefix ? `:${prefix}` : ''}`;
  }

  private getName(name: string, prefix?: string): string {
    return prefix ? `${prefix}:${name}` : name;
  }
}
