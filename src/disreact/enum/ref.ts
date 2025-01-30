import {NONE} from '#src/disreact/enum/index.ts';
import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



export type Ref = D.TaggedEnum<{
  Ignore       : {id: str};
  Default      : {id: str};
  RestEmbed    : {id: str};
  RestComponent: {id: str};
  DialogLinked : {id: str};
}>;

export const Ref           = D.taggedEnum<Ref>();
export const Ignore        = Ref.Ignore;
export const Default       = () => Ref.Default({id: NONE});
export const RestEmbed     = Ref.RestEmbed;
export const RestComponent = Ref.RestComponent;
export const DialogLinked  = Ref.DialogLinked;

const decodings = {
  ig: Ignore,
  df: Default,
  re: RestEmbed,
  rc: RestComponent,
  dl: DialogLinked,
};

export const decode = (ref: str) => {
  const [compressed, ...ids] = ref.split('_');

  const id = ids.join('_');

  if (!(compressed in decodings)) return Default();

  return decodings[compressed as keyof typeof decodings]({id});
};

export const encode = Ref.$match({
  Ignore       : (ref) => `ig_${ref.id}`,
  Default      : (ref) => `df_${ref.id}`,
  RestEmbed    : (ref) => `re_${ref.id}`,
  RestComponent: (ref) => `rc_${ref.id}`,
  DialogLinked : (ref) => `dl_${ref.id}`,
});
