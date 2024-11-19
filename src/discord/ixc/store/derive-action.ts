import type {IxD, IxDc, IxDm} from '#src/discord/util/discord.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import type {IxAction} from '#src/discord/ixc/store/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {inspect} from 'node:util';
import type {ActionRow, TextInput} from 'dfx/types';
import {flatMapL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import {fromId} from '#src/discord/ixc/store/id-parse.ts';


export const deriveAction = (ix: IxD, d: IxDc | IxDm) => E.gen(function * () {
    yield * CSL.debug('[CUSTOM_ID]', d.custom_id);

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

    const action = {
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
    } as const satisfies IxAction;

    yield * CSL.debug('[ACTION]', inspect(action, true, null));

    return action;
});


