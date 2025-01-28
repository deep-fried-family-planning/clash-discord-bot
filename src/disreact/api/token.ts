import {FOURTEEN_MINUTES, NONE, NONE_BOOL, NONE_ID, NONE_NUM, ONE_MINUTE, SAFE_TTL_OFFSET_1_MIN, TWO_SECONDS} from '#src/disreact/api/constants.ts';
import {Defer, Rest} from '#src/disreact/api/index.ts';
import {D} from '#src/internal/pure/effect.ts';
import type {bool, str, unixdate} from '#src/internal/pure/types-pure.ts';



export type Token = D.TaggedEnum<{
  Unknown: {id: str; token: str; ttl: unixdate; ephemeral: bool; deferred?: boolean};
  Active : {id: str; token: str; ttl: unixdate; ephemeral: bool; deferred?: boolean};
  Expired: {id: str; token: str; ttl: unixdate; ephemeral: bool; deferred?: boolean};
}>;

export type Unknown = D.TaggedEnum.Value<Token, 'Unknown'>;
export type Active = D.TaggedEnum.Value<Token, 'Active'>;
export type Expired = D.TaggedEnum.Value<Token, 'Expired'>;


export const empty = () => ({
  id       : NONE_ID,
  token    : NONE,
  ttl      : NONE_NUM,
  deferred : NONE_BOOL,
  ephemeral: NONE_BOOL,
});

export const Token   = D.taggedEnum<Token>();
export const Unknown = () => Token.Unknown(empty()) as Token;
export const Active  = Token.Active;
export const Expired = Token.Expired;

export const makeUndeferred = (ix: Rest.Interaction) => {
  return Active({
    id       : ix.id,
    token    : ix.token,
    ttl      : Date.now() + TWO_SECONDS,
    ephemeral: ix.message?.flags === Rest.MessageFlag.EPHEMERAL,
  });
};

export const setDeferred = (tk: Token, defer: Defer.Defer) => {
  if (Defer.isNone(defer)) return tk;
  if (Defer.isClose(defer)) return tk;
  if (Defer.isOpenDialog(defer)) return tk;
  return Active({
    ...tk,
    ttl      : Date.now() + FOURTEEN_MINUTES,
    ephemeral: Defer.getEphemeral(defer),
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
    deferred : true,
  });

  return invalidateByTTL(tk);
};

export const compress = (tk: Token) => {
  return tk;
};

export const encode = ({_tag, ...data}: Token) => {
  return `${data.id}_${data.token}_${data.ttl}_${data.ephemeral}`; // todo
};
