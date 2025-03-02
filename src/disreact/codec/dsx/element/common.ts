import {S} from '#src/internal/pure/effect.ts';



export const Fields = S.Struct({
  _name: S.String,
  props: S.mutable(S.Any),
  meta : S.mutable(S.Struct({
    idx        : S.Number,
    id         : S.String,
    step_id    : S.String,
    full_id    : S.String,
    root_id    : S.optional(S.String),
    isRoot     : S.optional(S.Boolean),
    isMounted  : S.optional(S.Boolean),
    isModal    : S.optional(S.Boolean),
    isMessage  : S.optional(S.Boolean),
    isEphemeral: S.optional(S.Boolean),
  })),
}).fields;

export const T = S.Struct({
  _name: S.String,
  props: S.mutable(S.Any),

});
