import {NONE} from '#discord/constants/path.ts';
import type {OnClick} from '#discord/entities/component-data.ts';
import {Cx} from '#discord/entities/index.ts';
import {type ManagedOp, type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, type RestButton, type SelectOp, StyleB, StyleT} from '#pure/dfx';
import {D} from '#pure/effect';
import type {Mutable, num, str} from '#src/internal/pure/types-pure.ts';


type Meta = {
  auth?: str[];
  ref? : str;
  mod? : str;
};

export type T = D.TaggedEnum<{
  Button         : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  SecondaryButton: Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  PrimaryButton  : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  DangerButton   : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  SuccessButton  : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;

  Link   : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  Premium: Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;

  Select : Meta & {onClick?: OnClick<Mutable<OptSelect>, SelectOp>} & Mutable<OptSelect>;
  User   : Meta & {onClick?: OnClick<Mutable<OptUser>, ManagedOp>} & Mutable<OptUser>;
  Role   : Meta & {onClick?: OnClick<Mutable<OptRole>, ManagedOp>} & Mutable<OptRole>;
  Channel: Meta & {onClick?: OnClick<Mutable<OptChannel>, ManagedOp>} & Mutable<OptChannel>;
  Mention: Meta & {onClick?: OnClick<Mutable<OptMention>, ManagedOp>} & Mutable<OptMention>;
  Text   : Meta & {onClick?: OnClick<Mutable<OptText>, never>} & Mutable<OptText>;
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


export const Row       = (...cvs: (T | '' | boolean | undefined)[]) => cvs.filter(Boolean) as Row;
export const ButtonRow = (...cvs: (T | '' | boolean | undefined)[]) => cvs.filter(Boolean) as Row;

export const Button          = E.Button;
export const SecondaryButton = E.SecondaryButton;
export const PrimaryButton   = E.PrimaryButton;
export const DangerButton    = E.DangerButton;
export const SuccessButton   = E.SuccessButton;
export const Link            = E.Link;
export const Premium         = E.Premium;
export const Select          = (props: Omit<Extract<T, {_tag: 'Select'}>, '_tag'>) => Row(E.Select(props));
export const User            = (props: Omit<Extract<T, {_tag: 'User'}>, '_tag'>) => Row(E.User(props));
export const Role            = (props: Omit<Extract<T, {_tag: 'Role'}>, '_tag'>) => Row(E.Role(props));
export const Channel         = (props: Omit<Extract<T, {_tag: 'Channel'}>, '_tag'>) => Row(E.Channel(props));
export const Mention         = (props: Omit<Extract<T, {_tag: 'Mention'}>, '_tag'>) => Row(E.Mention(props));
export const Text            = (props: Omit<Extract<T, {_tag: 'Text'}>, '_tag'>) => Row(E.Text(props));


export const ShortText     = (props: Omit<Extract<T, {_tag: 'Text'}>, '_tag'>) => Row(E.Text(props));
export const ParagraphText = (props: Omit<Extract<T, {_tag: 'Text'}>, '_tag'>) => Row(E.Text({...props, style: StyleT.PARAGRAPH}));
export const SingleSelect  = (props: Omit<Extract<T, {_tag: 'Select'}>, '_tag'>) => Row(E.Select(props));


export const TypeMap = {
  Button         : Cx.button,
  SecondaryButton: Cx.button,
  PrimaryButton  : Cx.button,
  DangerButton   : Cx.button,
  SuccessButton  : Cx.button,

  Link   : Cx.link,
  Premium: Cx.premium,
  Select : Cx.select,

  User   : Cx.user,
  Role   : Cx.role,
  Channel: Cx.channel,
  Mention: Cx.mention,
  Text   : Cx.text,
};

const styleMap = {
  SecondaryButton: StyleB.SECONDARY,
  PrimaryButton  : StyleB.PRIMARY,
  DangerButton   : StyleB.DANGER,
  SuccessButton  : StyleB.SUCCESS,
};


export const make = (root: str, view: str, viewMod?: str) => (cv: T, row: num, col: num) => {
  const {_tag, ref, mod, auth, onClick, ...data} = cv;

  if (_tag in styleMap) {
    (data as Mutable<RestButton>).style = styleMap[_tag as keyof typeof styleMap];
  }

  return TypeMap[_tag]({
    path: {
      ...Cx.Path.empty(),
      root,
      view,
      ref: ref ?? NONE,
      row,
      col,
      mod: mod ?? viewMod ?? NONE,
    },
    auth   : auth ?? [],
    data   : data as never,
    onClick: onClick as never,
  });
};
