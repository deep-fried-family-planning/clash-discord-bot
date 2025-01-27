import {ONE_MINUTE, SAFE_TTL_OFFSET_1_MIN} from '#src/disreact/api/constants.ts';
import {Constants, Defer, type Rest} from '#src/disreact/api/index.ts';
import {D} from '#src/internal/pure/effect.ts';
import type {bool, str, unixdate} from '#src/internal/pure/types-pure.ts';



export type Token = D.TaggedEnum<{
  Unknown: {id: str; token: str; ttl: unixdate; ephemeral: bool};
  Active : {id: str; token: str; ttl: unixdate; ephemeral: bool};
  Expired: {id: str; token: str; ttl: unixdate; ephemeral: bool};
}>;

export type Unknown = D.TaggedEnum.Value<Token, 'Unknown'>;
export type Active = D.TaggedEnum.Value<Token, 'Active'>;
export type Expired = D.TaggedEnum.Value<Token, 'Expired'>;


export const empty = () => ({
  id       : Constants.__DISREACT_NONE_ID,
  token    : Constants.__DISREACT_NONE,
  ttl      : Constants.__DISREACT_NONE_NUM,
  ephemeral: Constants.__DISREACT_NONE_BOOL,
});

export const Token   = D.taggedEnum<Token>();
export const Unknown = () => Token.Unknown(empty());
export const Active  = Token.Active;
export const Expired = Token.Expired;

export const make = (ix: Rest.Interaction) => {
  return Active({
    id       : ix.id,
    token    : ix.token,
    ttl      : Date.now() + ONE_MINUTE * 14,
    ephemeral: false,
  });
};

export const isActive = (tk: Token): tk is Active => {
  if (tk._tag === 'Expired') return false;
  return tk.ttl - SAFE_TTL_OFFSET_1_MIN > Date.now();
};

export const isSameDefer = (defer: Defer.Defer) => (tk: Token) => {
  if (Defer.isNone(defer)) return false;
  if (Defer.isClose(defer)) return false;
  if (Defer.isOpenDialog(defer)) return false;
  return Defer.getEphemeral(defer) === tk.ephemeral;
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
    id,
    token,
    ttl      : parseInt(ttl),
    ephemeral: ephemeral === 'true',
  });

  return invalidateByTTL(tk);
};

export const compress = (tk: Token) => {
  return tk;
};

export const encode = ({_tag, ...data}: Token) => {
  return `${data.id}_${data.token}_${data.ttl}_${data.ephemeral}`; // todo
};
