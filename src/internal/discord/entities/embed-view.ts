import {Ex} from '#discord/entities/index.ts';
import type {RestEmbed} from '#pure/dfx';
import {D, pipe} from '#pure/effect';
import type {num, str} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  Controller  : RestEmbed;
  DialogLinked: RestEmbed & {refs: str[]};
  Basic       : RestEmbed & {ref: str};
}>;
export type Grid = T[];


export const E       = D.taggedEnum<T>();
export const is      = E.$is;
export const match   = E.$match;
export const pure    = <A extends T>(a: A) => a;
export const get     = <A extends T, B extends keyof A>(b: B) => (a: A): A[B] => a[b];
export const set     = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const setWith = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const map     = <A extends T>(fa: (a: A) => A) => (a: A) => fa(a);
export const mapTo   = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapGrid = <A>(fa: (a: T, row: num) => A) => (grid: Grid) => grid.map((row, rowIdx) => fa(row, rowIdx));


export const Controller   = E.Controller;
export const DialogLinked = E.DialogLinked;
export const Basic        = E.Basic;


export const TitleEmbed  = E.Controller;
export const BasicEmbed  = E.Basic;
export const DialogEmbed = E.DialogLinked;


export const isController   = is('Controller');
export const isDialogLinked = is('DialogLinked');
export const isBasic        = is('Basic');


export const make = (root: str, view: str) => (ve: T, row: num) => {
  const path = pipe(
    Ex.Path.empty(),
    Ex.Path.set('root', root),
    Ex.Path.set('view', view),
    Ex.Path.set('tag', ve._tag),
    Ex.Path.set('row', row),
  );

  if (isController(ve)) {
    const {_tag, ...data} = ve;

    return Ex.Controller({
      path : path,
      query: new URLSearchParams(),
      data : data,
    });
  }

  if (isDialogLinked(ve)) {
    const {_tag, refs, ...data} = ve;

    const query = new URLSearchParams();

    for (const ref of refs) {
      query.set(ref, 'd');
    }

    return Ex.DialogLinked({
      path,
      query: query,
      refs : refs,
      data : data,
    });
  }

  const {_tag, ref, ...data} = ve;

  return Ex.Basic({
    path: pipe(
      path,
      Ex.Path.set('ref', ref),
    ),
    query: new URLSearchParams(),
    data : data,
  });
};
