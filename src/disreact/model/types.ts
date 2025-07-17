export type IntrinsicKey = string;

export interface JsxEncoding {
  primitive: string;
  normalize: Record<string, string>;
  transform: Record<
    string,
    (self: {props: any}, acc: any) => any
  >;
}
