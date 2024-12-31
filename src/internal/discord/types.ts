import {RxType} from '#pure/dfx';
import type {IxD} from '#src/internal/discord.ts';
import type {MessageComponentDatum, ModalSubmitDatum} from 'dfx/types';


export type IxIn =
  IxD
  & {data: ModalSubmitDatum | MessageComponentDatum};


export type IxDataDialog =
  IxD
  & {data: MessageComponentDatum};


export const isDialogSubmit = (ix: IxIn) => ix.type === RxType.MODAL_SUBMIT;
export const isClick        = (ix: IxIn) => ix.type === RxType.MESSAGE_COMPONENT;
