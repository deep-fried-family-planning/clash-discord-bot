import {Ar, Kv, p, pipe} from '#src/internal/pure/effect.ts';
import type {ActionRow, Button, SelectMenu, TextInput} from 'dfx/types';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import type {IxD} from '#src/internal/discord.ts';
import type {IxIn} from '#src/internal/ix-system/model/types.ts';


export const mapIx = <
    T,
>(
    f: (c: Button | SelectMenu | TextInput, row: num, col: num) => T,
) => (
    ix: IxIn,
) => p(
    ix.message.components as ActionRow[],
    Ar.flatMap((r, row) => p(
        r.components as (Button | SelectMenu | TextInput)[],
        Ar.map((c, col) => f(c, row, col)),
    )),
);


export const mapDx = <
    T,
>(
    f: (c: Button | SelectMenu | TextInput, row: num, col: num) => T,
) => (
    ix: IxIn,
) => p(
    (('components' in ix.data) ? ix.data.components : []) as ActionRow[],
    Ar.flatMap((r, row) => p(
        r.components as (Button | SelectMenu | TextInput)[],
        Ar.map((c, col) => f(c, row, col)),
    )),
);


export const mapInner = <
    T,
    V extends unknown[][],
>(
    f: (c: V[num][num], row: num, col: num) => T,
) => (
    cs: V,
) => p(
    cs,
    Ar.map((r, row) => p(r, Ar.map((c, col) => f(c, row, col)))),
);
