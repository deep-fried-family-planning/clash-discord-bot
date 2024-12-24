import {Ar, pipe} from '#src/internal/pure/effect';
import type {eobj, num, str} from '#src/internal/pure/types-pure.ts';
import type {ActionRow, Component} from 'dfx/types';
import type {Cx, Ex} from '.';


export type JustC<A extends eobj> = A[Exclude<keyof A, '$is' | '$match'>];
export type EnumJust<A extends {_tag: str}, B extends A['_tag']> = Extract<A, {_tag: B}>;


export const mapComponents = <A>(fa: (a: Component, row: num, col: num) => A) => (cs: Component[]) => pipe(
    cs as ActionRow[],
    Ar.flatMap((r, row) => pipe(
        r.components,
        Ar.map((c, col) => fa(c, row, col)),
    )),
);


export type NoTag<A extends {_tag: str}> = Omit<A, '_tag'>;


export type CxMap = Record<str, Cx.T>;
export type ExMap = Record<str, Ex.T>;
