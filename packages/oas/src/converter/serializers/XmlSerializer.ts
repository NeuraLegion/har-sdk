import type { Serializer } from './Serializer';
import { XmlObject } from './XmlObject';
import { toXML } from 'jstoxml';
import type { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

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
    // FIXME: instead of using the name root, it would be more appropriate to specify a schema name.
    const element = new XmlObject(xml ?? {}, 'root');

    if (schema.type === 'object') {
      return this.convertPropertiesToElements(data, schema, element);
    } else if (schema.type === 'array' && Array.isArray(data)) {
      return this.convertArrayToElements(
        data,
        schema as ArraySchemaObject,
        element
      );
    } else {
      return element.addContent(data);
    }
  }

  private convertPropertiesToElements(
    data: unknown,
    schema: SchemaObject,
    element: XmlObject
  ): XmlObject {
    for (const [key, subSchema] of Object.entries(schema.properties)) {
      const value = data ? data[key] : undefined;
      const propertySchema: SchemaObject = {
        ...subSchema,
        xml: this.getXmlOptions(subSchema, key)
      };

      this.convertPropertyToElement(value, propertySchema, element);
    }

    return element;
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
  ): XmlObject | XmlObject[] {
    const { items } = schema;
    const itemSchema: SchemaObject = {
      ...items,
      xml: this.getXmlOptions(schema.items, element.name)
    };
    const elements = data.flatMap((item) =>
      this.convertToElement(item, itemSchema)
    );

    return element.wrapping ? element.addContent(...elements) : elements;
  }

  private getXmlOptions({ xml = {} }: SchemaObject, newName?: string) {
    return {
      ...xml,
      name: xml.name ?? newName
    };
  }
}
