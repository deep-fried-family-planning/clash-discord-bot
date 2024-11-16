import type {IxRE} from '#src/discord/util/discord.ts';
import type {E} from '#src/internal/pure/effect.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */


export type IXCMessage = Partial<IxRE> | null;
export type IXCEffect = E.Effect<IXCMessage, any, any>;


export type ExEff<T> = E.Effect<T, any, any>;


const NAMESPACE_DELIMITER = ':';
const DATA_DELIMITER = '|';


export const stdNamespace = (n1: string, n2: string) => n2
    ? `${n1}${NAMESPACE_DELIMITER}${n2}`
    : n1;


export const stdData = (vs?: string[]) => vs?.length
    ? `${DATA_DELIMITER}${vs.join(DATA_DELIMITER)}`
    : '';


export const parseStdDataId = (id: string) => {
    console.debug('parseStdDataId', id);

    const [,...data] = id.split(DATA_DELIMITER);

    console.debug('parseStdDataId', ...data);

    return data;
};
