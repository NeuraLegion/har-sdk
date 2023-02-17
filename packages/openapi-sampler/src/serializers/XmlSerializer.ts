import { Serializer } from './Serializer';
import { OpenAPISchema } from '../samplers';
import { toXML, XmlElement } from 'jstoxml';

export class XmlSerializer implements Serializer {
  public serialize(data: unknown, schema: OpenAPISchema): string {
    const xmlElements = this.convertToXmlElement(data, schema);

    return toXML(xmlElements, {
      header: true,
      indent: '\t'
    });
  }

  // eslint-disable-next-line complexity
  public convertToXmlElement(data: unknown, schema: OpenAPISchema): any {
    const { type, properties, xml } = schema;

    let element: XmlElement;

    if (xml) {
      const { name, namespace, prefix, attribute } = xml;

      if (attribute) {
        return this.createAttribute(name, data);
      }

      const elementName = this.getElementName(prefix, name);
      element = this.createElement(elementName, namespace, prefix);
    }

    if (type === 'object' && properties) {
      const elements = Object.entries(properties).reduce(
        (acc: XmlElement[], [key, subSchema]: [string, OpenAPISchema]) => {
          const value = data ? data[key] : undefined;
          subSchema.xml = {
            ...subSchema?.xml,
            name: subSchema?.xml?.name ?? key
          };
          const property = this.convertToXmlElement(value, subSchema);
          if (subSchema.xml?.attribute) {
            (element._attrs = [].concat(element._attrs)).push(property);
          } else {
            acc.push(property);
          }

          return acc;
        },
        []
      );

      element._content = elements;

      return element;
    }

    if (type === 'array' && Array.isArray(data)) {
      const { items } = schema;
      const { name, wrapped, namespace, prefix } = xml || {};

      // @ts-expect-error wrong inferred type
      (items.xml ??= {}).name = items.xml.name ?? xml.name;

      const array = data.map((item) => this.convertToXmlElement(item, items));

      if (wrapped) {
        const elementName = prefix ? `${prefix}:${name}` : name || 'items';

        return this.createElement(elementName, namespace, prefix, array);
      } else {
        return array;
      }
    }

    if (element) {
      element._content = data;
    }

    return element ?? data;
  }

  private createAttribute(
    name: string,
    value: unknown
  ): Record<string, unknown> {
    return { [name]: value };
  }

  private createElement(
    name: string,
    namespace?: string,
    prefix?: string,
    children?: XmlElement[] | XmlElement | unknown
  ): XmlElement {
    return {
      _name: name,
      _attrs: namespace
        ? [{ [this.getNamespaceAttribute(prefix)]: namespace }]
        : [],
      _content: children
    };
  }

  private getNamespaceAttribute(prefix: string) {
    return `xmlns:${prefix}`;
  }

  private getElementName(prefix: string, name: string): string {
    return prefix ? `${prefix}:${name}` : name;
  }
}
