import type {Cx, Ex} from '#dfdis';
import type {IxD} from '#src/internal/discord.ts';
import type {neo, str} from '#src/internal/pure/types-pure.ts';
import type {MessageComponentDatum, ModalSubmitDatum} from 'dfx/types';


export type IxIn = IxD & {data: ModalSubmitDatum | MessageComponentDatum};
export const isModalIx = (data: IxIn['data']): data is ModalSubmitDatum => 'components' in data;
export const isComponentIx = (data: IxIn['data']): data is MessageComponentDatum => 'component_type' in data;


export type CxMap = Record<str, Cx.T>;
export type ExMap = Record<str, Ex.T>;


export type NoTag<A extends {_tag: str}> = Omit<A, '_tag'>;
export type JustC<A extends neo> = A[Exclude<keyof A, '$is' | '$match'>];
export type EnumJust<A extends {_tag: str}, B extends A['_tag']> = Extract<A, {_tag: B}>;


export type NotReadonly<T> = {-readonly [k in keyof T]: T[k]};
