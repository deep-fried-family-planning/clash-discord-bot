import {_Tag} from '#src/disreact/codec/common/index.ts';
import * as Component from '#src/disreact/codec/dsx/common/component.ts';
import {S} from '#src/internal/pure/effect.ts';



export const T = S.Struct({
  _tag        : S.tag(_Tag.TREE_SEED),
  root_id     : S.String,
  component   : S.Any,
  isEphemeral : S.optional(S.Boolean),
  isEntrypoint: S.optional(S.Boolean),
  isDialog    : S.optional(S.Boolean),
  isMessage   : S.optional(S.Boolean),
  isSync      : S.optional(S.Boolean),
  isAsync     : S.optional(S.Boolean),
  isEffect    : S.optional(S.Boolean),
});

const t = T.pipe(S.mutable);

export type T = S.Schema.Type<typeof t> & {
  component: Component.PFC;
};

export const is = (root: any): root is T => root._tag === _Tag.TREE_SEED;

export const make = (component: Component.PFC): T => {
  return {
    _tag   : _Tag.TREE_SEED,
    root_id: Component.resolveRootId(component),
    component,
  };
};
