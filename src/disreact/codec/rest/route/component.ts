import {S} from '#src/internal/pure/effect.ts';
import {_Tag, NONE} from '#src/disreact/codec/common/index.ts';



const TAG    = _Tag.COMPONENT;
const PREFIX = '/c/';
const EMPTY  = NONE;

export const T = S.mutable(S.Struct({
  _tag     : S.tag(TAG),
  root_id  : S.optional(S.String),
  step_id  : S.optional(S.String),
  doken_id : S.optional(S.String),
  custom_id: S.optional(S.String),
}));

export type T = S.Schema.Type<typeof T>;

export const is = (route: any): route is T => route._tag === TAG;

export const isPrefix = (encoded: string) => encoded.startsWith(PREFIX);

const Parsing = S.TemplateLiteralParser(
  PREFIX, S.String,
  '/', S.String,
  '/', S.String,
  '/', S.String,
);
const Encoder = S.encodeSync(Parsing);
const Decoder = S.decodeSync(Parsing);

export const encode = (route: T) => Encoder([
  PREFIX, route.root_id ?? EMPTY,
  '/', route.step_id ?? EMPTY,
  '/', route.doken_id ?? EMPTY,
  '/', route.custom_id ?? EMPTY,
]);

export const decode = (route: string): T => {
  const [, root_id, , step_id, , doken_id, , custom_id] = Decoder(route as never);

  const acc = {_tag: TAG} as T;

  if (root_id !== EMPTY) acc.root_id = root_id;
  if (step_id !== EMPTY) acc.step_id = step_id;
  if (doken_id !== EMPTY) acc.doken_id = doken_id;
  if (custom_id !== EMPTY) acc.custom_id = custom_id;

  return acc;
};
