import type {IxD} from '#src/internal/discord.ts';
import type {MessageComponentDatum, ModalSubmitDatum} from 'dfx/types';


export type IxIn =
  IxD
  & {data: ModalSubmitDatum | MessageComponentDatum};

export const isModalIx     = (data: IxIn['data']): data is ModalSubmitDatum => 'components' in data;
export const isComponentIx = (data: IxIn['data']): data is MessageComponentDatum => 'component_type' in data;
