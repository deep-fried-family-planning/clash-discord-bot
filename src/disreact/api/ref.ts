import {NONE} from '#src/disreact/api/constants.ts';
import {Constants} from '#src/disreact/api/index.ts';
import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



export type Ref = D.TaggedEnum<{
  Ignore       : {id: str};
  Default      : {id: str};
  RestEmbed    : {id: str};
  RestComponent: {id: str};
  DialogLinked : {id: str};
}>;

export type Ignore = D.TaggedEnum.Value<Ref, 'Ignore'>;
export type Default = D.TaggedEnum.Value<Ref, 'Default'>;
export type RestEmbed = D.TaggedEnum.Value<Ref, 'RestEmbed'>;
export type RestComponent = D.TaggedEnum.Value<Ref, 'RestComponent'>;
export type DialogLinked = D.TaggedEnum.Value<Ref, 'DialogLinked'>;

export const Ref = D.taggedEnum<Ref>();

export const Ignore          = Ref.Ignore;
export const Default         = () => Ref.Default({id: Constants.__DISREACT_NONE});
export const RestEmbed       = Ref.RestEmbed;
export const RestComponent   = Ref.RestComponent;
export const DialogLinked    = Ref.DialogLinked;
export const isIgnore        = Ref.$is('Ignore');
export const isDefault       = Ref.$is('Default');
export const isRestEmbed     = Ref.$is('RestEmbed');
export const isRestComponent = Ref.$is('RestComponent');
export const isDialogLinked  = Ref.$is('DialogLinked');

const decodings = {
  ig: Ignore,
  df: Default,
  re: RestEmbed,
  rc: RestComponent,
  dl: DialogLinked,
};

export const decode = (ref: str) => {
  const [compressed, ...ids] = ref.split('_');
  const id                   = ids.join('_');

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
