import {Any, Boolean, mutable, Number, optional, String, Struct} from 'effect/Schema';



export const Fields = Struct({
  _name: String,
  props: mutable(Any),
  meta : mutable(Struct({
    idx        : Number,
    id         : String,
    step_id    : String,
    full_id    : String,
    root_id    : optional(String),
    isRoot     : optional(Boolean),
    isMounted  : optional(Boolean),
    isModal    : optional(Boolean),
    isMessage  : optional(Boolean),
    isEphemeral: optional(Boolean),
  })),
}).fields;
