import {D} from '#pure/effect';
import {NONE} from '#src/internal/disreact/virtual/kinds/constants.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  Ignore       : {id: str};
  Default      : {id: str};
  RestEmbed    : {id: str};
  RestComponent: {id: str};
  DialogLinked : {id: str};
}>;

export type Ignore = D.TaggedEnum.Value<T, 'Ignore'>;
export type Default = D.TaggedEnum.Value<T, 'Default'>;
export type RestEmbed = D.TaggedEnum.Value<T, 'RestEmbed'>;
export type RestComponent = D.TaggedEnum.Value<T, 'RestComponent'>;
export type DialogLinked = D.TaggedEnum.Value<T, 'DialogLinked'>;

const T = D.taggedEnum<T>();

export const Ignore        = T.Ignore;
export const Default       = () => T.Default({id: NONE});
export const RestEmbed     = T.RestEmbed;
export const RestComponent = T.RestComponent;
export const DialogLinked  = T.DialogLinked;

export const isIgnore = T.$is('Ignore');
export const isDefault = T.$is('Default');
export const isRestEmbed = T.$is('RestEmbed');
export const isRestComponent = T.$is('RestComponent');
export const isDialogLinked = T.$is('DialogLinked');


const decodings = {
  ig: Ignore,
  df: Default,
  rc: RestComponent,
  dl: DialogLinked,
};

export const decode = (ref: str) => {
  const [compressed, ...ids] = ref.split('_');
  const id                   = ids.join('_');

  if (!(compressed in decodings)) {
    return Default();
  }

  return decodings[compressed as keyof typeof decodings]({id});
};


export const encode = T.$match({
  Ignore       : (ref) => `ig_${ref.id}`,
  Default      : (ref) => `df_${ref.id}`,
  RestEmbed    : (ref) => `re_${ref.id}`,
  RestComponent: (ref) => `rc_${ref.id}`,
  DialogLinked : (ref) => `dl_${ref.id}`,
});
