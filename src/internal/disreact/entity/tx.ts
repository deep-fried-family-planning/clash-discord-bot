import {TxFlag, TxType} from '#pure/dfx';
import {D} from '#pure/effect';
import type {obj, str} from '#src/internal/pure/types-pure.ts';
import type {InteractionCallbackMessage, InteractionCallbackModal} from 'dfx/types';


export type Dialog = InteractionCallbackModal;
export type Message = InteractionCallbackMessage;


export type Defer = D.TaggedEnum<{
  none          : obj;
  close         : obj;
  public        : {type: TxType['DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE']};
  public_update : {type: TxType['DEFERRED_UPDATE_MESSAGE']};
  private       : {type: TxType['DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE']; data: {flags: TxFlag['EPHEMERAL']}};
  private_update: {type: TxType['DEFERRED_UPDATE_MESSAGE']; data: {flags: TxFlag['EPHEMERAL']}};
  open_dialog   : {type: TxType['MODAL']};
}>;


const defer                  = D.taggedEnum<Defer>();
export const None            = defer.none() as Defer;
export const Close            = defer.close() as Defer;
export const Public          = defer.public({type: TxType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE});
export const PublicUpdate    = defer.public_update({type: TxType.DEFERRED_UPDATE_MESSAGE});
export const Private         = defer.private({type: TxType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data: {flags: TxFlag.EPHEMERAL}});
export const PrivateUpdate   = defer.private_update({type: TxType.DEFERRED_UPDATE_MESSAGE, data: {flags: TxFlag.EPHEMERAL}});
export const OpenDialog      = defer.open_dialog({type: TxType.MODAL});
export const isNone          = defer.$is('none');
export const isClose        = defer.$is('close');
export const isPublic        = defer.$is('public');
export const isPublicUpdate  = defer.$is('public_update');
export const isPrivate       = defer.$is('private');
export const isPrivateUpdate = defer.$is('private_update');
export const isOpenDialog    = defer.$is('open_dialog');


export const getFlags = defer.$match({
  none          : (tx) => 0,
  close         : () => 0,
  public        : (tx) => 0,
  public_update : (tx) => 0,
  private       : (tx) => tx.data.flags,
  private_update: (tx) => tx.data.flags,
  open_dialog   : (tx) => 0,
});

export const makeDialog = (data: unknown) => ({type: OpenDialog.type, data: data as InteractionCallbackModal});


const lookup = {
  N: None,
  C: Close,
  P: Public,
  Q: PublicUpdate,
  R: Private,
  S: PrivateUpdate,
  D: OpenDialog,
};


export const decode = (tx: str) => {
  if (tx in lookup) {
    return lookup[tx as keyof typeof lookup];
  }
  return None;
};


export const encode = defer.$match({
  none          : () => 'N',
  close         : () => 'C',
  public        : () => 'P',
  public_update : () => 'Q',
  private       : () => 'R',
  private_update: () => 'S',
  open_dialog   : () => 'D',
});
