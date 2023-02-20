import { Serializer } from './Serializer';
import { XmlObject } from './XmlObject';
import { toXML } from 'jstoxml';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

type SchemaObject = OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject;
type ArraySchemaObject = OpenAPIV3.ArraySchemaObject | OpenAPIV2.ItemsObject;

export class XmlSerializer implements Serializer {
  public serialize(data: unknown, schema: SchemaObject): string {
    const obj = this.convertToElement(data, schema);
    const elements = [].concat(obj).map((x) => x.build());

    return toXML(elements, {
      header: true,
      indent: '\t'
    });
  }

  private convertToElement(
    data: unknown,
    schema: SchemaObject
  ): XmlObject | XmlObject[] {
    const { xml } = schema;
    const element = new XmlObject(xml ?? {}, 'root');

    if (schema.type === 'object') {
      this.convertPropertiesToElements(data, schema, element);
    } else if (schema.type === 'array' && Array.isArray(data)) {
      const children = this.convertArrayToElements(
        data,
        schema as ArraySchemaObject,
        element
      );

      if (element.wrapping) {
        element.addContent(...children);
      } else {
        return children;
      }
    } else {
      element.addContent(data);
    }

    return element;
  }

  private convertPropertiesToElements(
    data: unknown,
    schema: SchemaObject,
    element: XmlObject
  ): void {
    Object.entries(schema.properties).forEach(
      ([key, subSchema]: [string, SchemaObject]) => {
        const value = data ? data[key] : undefined;
        const propertySchema = {
          ...subSchema,
          xml: this.getXmlOptions(subSchema, key)
        };

        this.convertPropertyToElement(value, propertySchema, element);
      }
    );
  }

  private convertPropertyToElement(
    value: unknown,
    schema: SchemaObject,
    element: XmlObject
  ): void {
    const { xml } = schema;
    const { attribute, name, prefix } = xml ?? {};

    if (attribute) {
      element.addAttribute({ value, prefix, name });
    } else {
      const childElement = this.convertToElement(value, schema);
      element.addContent(...[].concat(childElement));
    }
  }

  private convertArrayToElements(
    data: unknown[],
    schema: ArraySchemaObject,
    element: XmlObject
  ): XmlObject[] {
    const { items } = schema;
    const itemSchema: SchemaObject = {
      ...items,
      xml: this.getXmlOptions(schema.items, element.name)
    };

    return data.flatMap((item) => this.convertToElement(item, itemSchema));
  }

  private getXmlOptions({ xml = {} }: SchemaObject, newName?: string) {
    return {
      ...xml,
      name: xml.name ?? newName
    };
  }
}
