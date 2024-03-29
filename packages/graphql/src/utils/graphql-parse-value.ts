import { type ASTNode, Kind, parseValue, visit } from '@har-sdk/core';

const getNodeValue = (valueNode: ASTNode): unknown => {
  switch (valueNode.kind) {
    case Kind.INT:
      return parseInt(valueNode.value, 10);
    case Kind.FLOAT:
      return parseFloat(valueNode.value);
    case Kind.BOOLEAN:
      return valueNode.value;
    case Kind.STRING:
    case Kind.ENUM:
      return valueNode.value;
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return [];
    case Kind.OBJECT:
      return {};
    case Kind.OBJECT_FIELD:
      return valueNode.name.value;
    default:
      return undefined;
  }
};

export const graphQLParseValue = (source: string): unknown => {
  const valueNode: ASTNode = parseValue(source);
  const resultStack: unknown[] = [];
  const nodeStack: ASTNode[] = [];

  visit(valueNode, {
    enter(node) {
      const nodeValue = getNodeValue(node);

      if (nodeStack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const parentNode = nodeStack[nodeStack.length - 1]!;

        switch (parentNode.kind) {
          case Kind.OBJECT_FIELD:
            // eslint-disable-next-line no-case-declarations
            const parentObject = resultStack[resultStack.length - 2] as Record<
              string,
              unknown
            >;
            parentObject[parentNode.name.value] = nodeValue;
            break;
          case Kind.LIST:
            // eslint-disable-next-line no-case-declarations
            const parentArray = resultStack[
              resultStack.length - 1
            ] as unknown[];
            parentArray.push(nodeValue);
            break;
        }
      }

      nodeStack.push(node);
      resultStack.push(nodeValue);
    },
    leave(_) {
      nodeStack.pop();
      if (resultStack.length > 1) {
        resultStack.pop();
      }
    }
  });

  return resultStack.shift();
};
