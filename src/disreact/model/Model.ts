import * as Schema from 'effect/Schema';

export const Attributes = <A extends Schema.Struct.Fields>(fields: A) =>
  Schema.Struct({
    ...fields,
    id: Schema.String,
  });

export const Event = <
  A extends string,
  B extends Schema.Struct.Field,
>(type: A, target: B) =>
  Schema.Struct({
    id    : Schema.String,
    type  : Schema.tag(type),
    target: target,
  });
