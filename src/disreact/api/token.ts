import {NONE} from '#disreact/runtime/codec.ts';
import {D} from '#pure/effect';
import type {snow} from '#src/discord/types.ts';
import type {bool, epochms, str} from '#src/internal/pure/types-pure.ts';
// import type {DA} from '#src/internal/disreact/virtual/entities/index.ts';
// import {Df} from '#src/internal/disreact/virtual/entities/index.ts';



const ONE_MINUTE = 60 * 1000;
const SAFE_TTL_OFFSET_1_MIN = 60 * 1000;


export type Token = D.TaggedEnum<{
  Unknown: {id: snow; token: str; ttl: epochms; ephemeral: bool};
  Active : {id: snow; token: str; ttl: epochms; ephemeral: bool};
  Expired: {id: snow; token: str; ttl: epochms; ephemeral: bool};
}>;


const T = D.taggedEnum<Token>();


export const Unknown = () => T.Unknown({id: '0', token: NONE, ttl: -1, ephemeral: false});
export const Active = T.Active;
export const Expired = T.Expired;


export const make = (ix: DA.Ix) => {
  return Active({
    id       : ix.id,
    token    : ix.token,
    ttl      : Date.now() + ONE_MINUTE * 14,
    ephemeral: false,
  });
};


export const isActive = (tk: Token) => {
  if (tk._tag === 'Expired') return false;
  return tk.ttl - SAFE_TTL_OFFSET_1_MIN > Date.now();
};


export const isSameDefer = (defer: Df.T) => (tk: Token) => {
  if (Df.isNone(defer)) return false;
  if (Df.isClose(defer)) return false;
  if (Df.isOpenDialog(defer)) return false;
  return Df.getEphemeral(defer) === tk.ephemeral;
};


export const invalidateByTTL = (tk: Token) => {
  if (tk._tag === 'Expired') return tk;
  if (!isActive(tk)) return Expired(tk);
  return Active(tk);
};


export const decompress = (tk: Token) => {
  return tk; // todo
};


export const decode = (encoded: str) => {
  const [id, token, ttl, ephemeral] = encoded.split('_');

  const tk = Active({
    id       : id as snow,
    token,
    ttl      : parseInt(ttl),
    ephemeral: ephemeral === 'true',
  });

  return invalidateByTTL(tk);
};


export const compress = (tk: Token) => {
  return tk; // todo
};


export const encode = ({_tag, ...data}: Token) => {
  return `${data.id}_${data.token}_${data.ttl}_${data.ephemeral}`; // todo
};
