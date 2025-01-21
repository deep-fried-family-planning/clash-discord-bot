import {type JSXNode, RenderedNode} from '@disreact-jsx/types.ts';


export class SerializationError extends Error {
  public constructor(public readonly invalidValue: unknown) {
    super('Invalid value');
  }
}

interface RawContentNodeTest {
  htmlContent?: string | undefined;
}

export function serialize(
  value: JSXNode,
  escaper: (value: string) => string,
): string {
  // Null and undefined handling
  if (value === null || value === undefined) {
    return '';
  }
  // String node handling
  if (typeof value === 'string') {
    return escaper(value);
  }
  // Number node handling
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  // Boolean node handling
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  // Function node handling
  if (typeof value === 'function') {
    return serialize(value(), escaper);
  }
  // RenderedNode node handling
  if (value instanceof RenderedNode) {
    return value.string;
  }
  // Dangerous string handling
  if (
    typeof value === 'object'
    && typeof (value as RawContentNodeTest).htmlContent === 'string'
  ) {
    return value.htmlContent;
  }

  throw new SerializationError(value);
}
