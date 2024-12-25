import type {ComponentMapItem} from '#src/discord/store/derive-state.ts';
import {fromId} from '#src/discord/store/id-parse.ts';
import type {Route} from '#src/discord/store/id-routes.ts';
import type {IxD, IxDc, IxDm} from '#src/internal/discord.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {flatMapL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ActionRow, TextInput} from 'dfx/types';


export type Ax = {
    id      : Route;
    selected : {
        type : str;
        value: str;
    }[];
    forward?: str | undefined;
    original: IxDm;
    cmap?   : Record<string, Maybe<ComponentMapItem<TextInput>>> | undefined;
};


export const deriveAction = (ix: IxD, d: IxDc | IxDm) => {
    const id = fromId(d.custom_id);

    const cmap = 'components' in d
        ? pipe(
            d.components as ActionRow[],
            mapL((row) => pipe(row.components as TextInput[], mapL((c) => ({
                id      : fromId(c.custom_id),
                original: c,
            })))),
            flatMapL((c) => c),
            reduceL(emptyKV<string, Maybe<ComponentMapItem<TextInput>>>(), (cs, c) => {
                cs[c.id.predicate] = c;
                return cs;
            }),
        )
        : undefined;

    return {
        id,
        original: d as unknown as IxDm,
        selected: 'values' in d
            ? d.values.map((d) => ({
                type : 'string',
                value: d as unknown as str,
            }))
            : [],
        forward: id.params.forward,
        cmap,
    } as const satisfies Ax;
};
