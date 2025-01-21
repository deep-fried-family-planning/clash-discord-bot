import type {In} from '#disreact/virtual/entities/index.ts';
import {Df} from '#disreact/virtual/entities/index.ts';
import {NONE} from '#disreact/virtual/kinds/constants.ts';
import {D, pipe} from '#pure/effect';
import type {snow} from '#src/discord/types.ts';
import type {epochms, str} from '#src/internal/pure/types-pure.ts';


const ONE_MINUTE = 60 * 1000;
const SAFE_TTL_OFFSET_1_MIN = 60 * 1000;


export type Token = D.TaggedEnum<{
  Unknown: {id: snow | str; token: str; ttl: epochms; ephemeral: boolean};
  Active : {id: snow | str; token: str; ttl: epochms; ephemeral: boolean};
  Expired: {id: snow | str; token: str; ttl: epochms; ephemeral: boolean};
}>;


const T = D.taggedEnum<Token>();


export const Unknown = () => T.Unknown({id: NONE, token: NONE, ttl: -1, ephemeral: false});
export const Active = T.Active;
export const Expired = T.Expired;


export const make = (ix: In.T) => {
  if (ix._tag === 'None') return Unknown();

  return Active({
    id       : ix.curr_id,
    token    : ix.curr_token,
    ttl      : Date.now() + ONE_MINUTE * 14,
    ephemeral: false,
  });
};


export const isActive = (tk: Token) => {
  if (tk._tag === 'Expired') {
    return false;
  }
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


export const decode = (tk: str) => {
  const [id, token, ttl, ephemeral] = tk.split('_');

  return pipe(
    Active({
      id,
      token,
      ttl      : parseInt(ttl),
      ephemeral: ephemeral === 'true',
    }),
    invalidateByTTL,
  );
};


export const compress = (tk: Token) => {
  return tk; // todo
};


export const encode = ({_tag, ...data}: Token) => {
  return `${data.id}_${data.token}_${data.ttl}_${data.ephemeral}`; // todo
};
