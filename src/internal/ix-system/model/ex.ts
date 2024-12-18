import type {Embed} from 'dfx/types';
import type {str} from '#src/internal/pure/types-pure.ts';
import {p} from '#src/internal/pure/effect.ts';
import type {RestEmbed} from '#src/internal/ix-system/model/types.ts';


export type Rest = Embed;


export const basic = (
    config: {
        name: str;
    },
) => config;


export const makeBasic = (
    rest: Rest,
) => (
    config: ReturnType<typeof basic>,
) => ({
    ...rest,
    author: {
        name: config.name,
    },
});


export const BasicEmbed = (
    {
        id,
        ...rest
    }: {
        id: str;
    } & RestEmbed,
) => ({
    ...rest,
    author: {
        name: id,
    },
});


export const editorEmbed = (

) => ({
    name: 'Record',
});


export const recordEmbed = (

) => ({
    name: 'Record',
});
