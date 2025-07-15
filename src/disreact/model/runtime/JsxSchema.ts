export type JsxSchema = never;

export type Encoding<T extends string, N extends string> = {
  primitive: string;
  normalize: Record<string, string>;
  transform: Record<string, (self: any, acc: any) => any>;
};
