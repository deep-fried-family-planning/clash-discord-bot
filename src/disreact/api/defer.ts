import {TxFlag, TxType} from '#pure/dfx';
import {D} from '#pure/effect';
import type {DA} from '#src/internal/disreact/virtual/entities/index.ts';
import type {bool, mut, str} from '#src/internal/pure/types-pure.ts';



export type T = D.TaggedEnum<{
  None         : {done?: bool};
  Close        : {done?: bool};
  Public       : {done?: bool; rest: {type: typeof DA.En.Rx['DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE']}};
  PublicUpdate : {done?: bool; rest: {type: TxType['DEFERRED_UPDATE_MESSAGE']}};
  Private      : {done?: bool; rest: {type: TxType['DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE']; data: {flags: TxFlag['EPHEMERAL']}}};
  PrivateUpdate: {done?: bool; rest: {type: TxType['DEFERRED_UPDATE_MESSAGE']; data: {flags: TxFlag['EPHEMERAL']}}};
  OpenDialog   : {done?: bool; rest: {type: TxType['MODAL']}};
}>;

export type None = D.TaggedEnum.Value<T, 'None'>;
export type Close = D.TaggedEnum.Value<T, 'Close'>;
export type Public = D.TaggedEnum.Value<T, 'Public'>;
export type PublicUpdate = D.TaggedEnum.Value<T, 'PublicUpdate'>;
export type Private = D.TaggedEnum.Value<T, 'Private'>;
export type PrivateUpdate = D.TaggedEnum.Value<T, 'PrivateUpdate'>;
export type OpenDialog = D.TaggedEnum.Value<T, 'OpenDialog'>;

const T = D.taggedEnum<T>();

export const None          = T.None({}) as T;
export const Close         = T.Close({});
export const Public        = T.Public({rest: {type: TxType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE}});
export const PublicUpdate  = T.PublicUpdate({rest: {type: TxType.DEFERRED_UPDATE_MESSAGE}});
export const Private       = T.Private({rest: {type: TxType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data: {flags: TxFlag.EPHEMERAL}}});
export const PrivateUpdate = T.PrivateUpdate({rest: {type: TxType.DEFERRED_UPDATE_MESSAGE, data: {flags: TxFlag.EPHEMERAL}}});
export const OpenDialog    = T.OpenDialog({rest: {type: TxType.MODAL}});

export const isNone          = T.$is('None');
export const isClose         = T.$is('Close');
export const isPublic        = T.$is('Public');
export const isPublicUpdate  = T.$is('PublicUpdate');
export const isPrivate       = T.$is('Private');
export const isPrivateUpdate = T.$is('PrivateUpdate');
export const isOpenDialog    = T.$is('OpenDialog');


export const getEphemeral = T.$match({
  None         : () => false,
  Close        : () => false,
  Public       : () => false,
  PublicUpdate : () => false,
  Private      : () => true,
  PrivateUpdate: () => true,
  OpenDialog   : () => false,
});


export const setDone = (df: T) => {
  (df as mut<typeof df>).done = true;
  return df;
};


const lookup = {
  A: None,
  B: Close,
  C: Public,
  D: PublicUpdate,
  E: Private,
  F: PrivateUpdate,
  G: OpenDialog,
};


export const decodeDefer = (tx: str) => {
  if (tx in lookup) {
    return lookup[tx as keyof typeof lookup];
  }
  return None;
};


export const encodeDefer = T.$match({
  None         : () => 'A',
  Close        : () => 'B',
  Public       : () => 'C',
  PublicUpdate : () => 'D',
  Private      : () => 'E',
  PrivateUpdate: () => 'F',
  OpenDialog   : () => 'G',
});
