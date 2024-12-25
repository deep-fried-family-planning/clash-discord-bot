import {Ar, pipe} from '#src/internal/pure/effect.ts';
import type {num} from '#src/internal/pure/types-pure.ts';
import type {ActionRow, Component} from 'dfx/types';


export const mapComponents = <A>(fa: (a: Component, row: num, col: num) => A) => (cs: Component[]) => pipe(
    cs as ActionRow[],
    Ar.flatMap((r, row) => pipe(
        r.components,
        Ar.map((c, col) => fa(c, row, col)),
    )),
);
