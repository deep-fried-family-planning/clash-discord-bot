import type {num, str} from '#src/internal/pure/types-pure.ts';
import {inspect} from 'node:util';
import type {ActionRow, Button, SelectMenu, TextInput} from 'dfx/types';
import type {IxIn} from '#src/internal/ix-v2/model/types.ts';
import {Ar, p} from '#src/internal/pure/effect.ts';


export const logThru = <T>(name: str) => (loggable: T) => {
    console.log(`[${name}]`, inspect(loggable, true, null));

    return loggable;
};


export const mapIx = <
    T,
>(
    f: (c: Button | SelectMenu | TextInput, row: num, col: num) => T,
) => (
    ix: IxIn,
) => p(
    ix.message.components as ActionRow[],
    Ar.map((r, row) => p(
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
    Ar.map((r, row) => p(
        r.components as (Button | SelectMenu | TextInput)[],
        Ar.map((c, col) => f(c, row, col)),
    )),
);


export const map2d = <
    T, U,
>(
    f: (c: T, row: num, col: num) => U,
) => (
    a: T[][],
) => p(a, Ar.map((r, row) => p(r, Ar.map((c, col) => f(c, row, col)))));
