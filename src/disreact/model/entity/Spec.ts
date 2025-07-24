import * as Schema from 'effect/Schema';

export const JsxProps = <A extends Schema.Struct.Fields>(fields: A) =>
  Schema.Struct(fields);

export const Jsx = Schema.String;
