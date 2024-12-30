import type {OnClick} from '#discord/entities/basic/component-data.ts';
import {Cx} from '#discord/entities/basic/index.ts';
import {COL_NONE, NONE, ROW_NONE} from '#discord/entities/constants/path.ts';
import type {ManagedOp, OptButton, OptChannel, OptMention, OptRole, OptSelect, OptText, OptUser, SelectOp} from '#pure/dfx';
import {D, pipe} from '#pure/effect';
import type {Mutable, num, str} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  Button : {ref?: str; onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  Link   : {ref?: str; onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  Premium: {ref?: str; onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  Select : {ref?: str; onClick?: OnClick<Mutable<OptSelect>, SelectOp>} & Mutable<OptSelect>;
  User   : {ref?: str; onClick?: OnClick<Mutable<OptUser>, ManagedOp>} & Mutable<OptUser>;
  Role   : {ref?: str; onClick?: OnClick<Mutable<OptRole>, ManagedOp>} & Mutable<OptRole>;
  Channel: {ref?: str; onClick?: OnClick<Mutable<OptChannel>, ManagedOp>} & Mutable<OptChannel>;
  Mention: {ref?: str; onClick?: OnClick<Mutable<OptMention>, ManagedOp>} & Mutable<OptMention>;
  Text   : {ref?: str; onClick?: OnClick<Mutable<OptText>, never>} & Mutable<OptText>;
}>;
export type Row = T[];
export type Grid = T[][];


export const E       = D.taggedEnum<T>();
export const is      = E.$is;
export const match   = E.$match;
export const pure    = <A extends T>(a: A) => a;
export const get     = <A extends T, B extends keyof A>(b: B) => (a: A): A[B] => a[b];
export const set     = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const setWith = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const map     = <A extends T>(fa: (a: A) => A) => (a: A) => fa(a);
export const mapTo   = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapGrid = <A>(fa: (a: T, row: num, col: num) => A) => (grid: Grid) => grid.map((row, rowIdx) => row.map((cx, colIdx) => fa(cx, rowIdx, colIdx)));


export const Row = (...cvs: (T | '' | boolean | undefined)[]) => cvs.filter(Boolean) as Row;

export const Button  = E.Button;
export const Link    = E.Link;
export const Premium = E.Premium;
export const Select  = (props: Omit<Extract<T, {_tag: 'Select'}>, '_tag'>) => Row(E.Select(props));
export const User    = (props: Omit<Extract<T, {_tag: 'User'}>, '_tag'>) => Row(E.User(props));
export const Role    = (props: Omit<Extract<T, {_tag: 'Role'}>, '_tag'>) => Row(E.Role(props));
export const Channel = (props: Omit<Extract<T, {_tag: 'Channel'}>, '_tag'>) => Row(E.Channel(props));
export const Mention = (props: Omit<Extract<T, {_tag: 'Mention'}>, '_tag'>) => Row(E.Mention(props));
export const Text    = (props: Omit<Extract<T, {_tag: 'Text'}>, '_tag'>) => Row(E.Text(props));


export const TypeMap = {
  Button : Cx.Button,
  Link   : Cx.Link,
  Premium: Cx.Premium,
  Select : Cx.Select,
  User   : Cx.User,
  Role   : Cx.Role,
  Channel: Cx.Channel,
  Mention: Cx.Mention,
  Text   : Cx.Text,
};


export const make = (cv: T, row?: num, col?: num) => {
  const {_tag, ref, onClick, ...data} = cv;

  const path = pipe(
    Cx.Path.empty(),
    Cx.Path.set('ref', ref ?? NONE),
    Cx.Path.set('row', row ?? ROW_NONE),
    Cx.Path.set('col', col ?? COL_NONE),
  );

  return TypeMap[_tag]({
    path   : path,
    data   : data as never,
    onClick: onClick as never,
  });
};
