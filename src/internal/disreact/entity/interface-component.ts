import {type ManagedOp, type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, type RestButton, type SelectOp, StyleB, StyleT} from '#pure/dfx';
import {D} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import type {OnClick} from '#src/internal/disreact/entity/data-component.ts';
import type {Auth} from '#src/internal/disreact/entity/index.ts';
import {Cd} from '#src/internal/disreact/entity/index.ts';
import type {mut, Mutable, num, opt, str} from '#src/internal/pure/types-pure.ts';


type Meta = {
  auth?: Auth.T[];
  ref? : str;
  mod? : str;
};

export type T = D.TaggedEnum<{
  Button         : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  SecondaryButton: Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  PrimaryButton  : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  DangerButton   : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  SuccessButton  : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  Link           : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  Premium        : Meta & {onClick?: OnClick<Mutable<OptButton>, never>} & Mutable<OptButton>;
  Select         : Meta & {onClick?: OnClick<Mutable<OptSelect>, SelectOp>} & Mutable<OptSelect>;
  User           : Meta & {onClick?: OnClick<Mutable<OptUser>, ManagedOp>} & Mutable<OptUser>;
  Role           : Meta & {onClick?: OnClick<Mutable<OptRole>, ManagedOp>} & Mutable<OptRole>;
  Channel        : Meta & {onClick?: OnClick<Mutable<OptChannel>, ManagedOp>} & Mutable<OptChannel>;
  Mention        : Meta & {onClick?: OnClick<Mutable<OptMention>, ManagedOp>} & Mutable<OptMention>;
  Text           : Meta & {onClick?: OnClick<Mutable<OptText>, never>} & Mutable<OptText>;
}>;
export type Row = T[];
export type Grid = T[][];


export const T               = D.taggedEnum<T>();
export const is              = T.$is;
export const mapGrid         = <A>(fa: (a: T, row: num, col: num) => A) => (grid: Grid) => grid.map((row, rowIdx) => row.map((cx, colIdx) => fa(cx, rowIdx, colIdx)));
export const Row             = (...cvs: (T | '' | boolean | undefined)[]) => cvs.filter(Boolean) as Row;
export const ButtonRow       = (...cvs: (T | '' | boolean | undefined)[]) => cvs.filter(Boolean) as Row;
export const _Button         = T.Button;
export const SecondaryButton = T.SecondaryButton;
export const PrimaryButton   = T.PrimaryButton;
export const DangerButton    = T.DangerButton;
export const SuccessButton   = T.SuccessButton;
export const _Link           = T.Link;
export const Premium         = T.Premium;
export const _Select         = (props: Omit<Extract<T, {_tag: 'Select'}>, '_tag'>) => Row(T.Select(props));
export const _User           = (props: Omit<Extract<T, {_tag: 'User'}>, '_tag'>) => Row(T.User(props));
export const _Role           = (props: Omit<Extract<T, {_tag: 'Role'}>, '_tag'>) => Row(T.Role(props));
export const _Channel        = (props: Omit<Extract<T, {_tag: 'Channel'}>, '_tag'>) => Row(T.Channel(props));
export const _Mention        = (props: Omit<Extract<T, {_tag: 'Mention'}>, '_tag'>) => Row(T.Mention(props));
export const Text            = (props: Omit<Extract<T, {_tag: 'Text'}>, '_tag'>) => Row(T.Text(props));
export const ShortText       = (props: Omit<Extract<T, {_tag: 'Text'}>, '_tag'>) => Row(T.Text(props));
export const ParagraphText   = (props: Omit<Extract<T, {_tag: 'Text'}>, '_tag'>) => Row(T.Text({...props, style: StyleT.PARAGRAPH}));
export const SingleSelect    = (props: Omit<Extract<T, {_tag: 'Select'}>, '_tag'>) => Row(T.Select(props));


export const TypeMap = {
  Button         : Cd.button,
  SecondaryButton: Cd.button,
  PrimaryButton  : Cd.button,
  DangerButton   : Cd.button,
  SuccessButton  : Cd.button,
  Link           : Cd.link,
  Premium        : Cd.premium,
  Select         : Cd.select,
  User           : Cd.user,
  Role           : Cd.role,
  Channel        : Cd.channel,
  Mention        : Cd.mention,
  Text           : Cd.text,
};

const styleMap = {
  SecondaryButton: StyleB.SECONDARY,
  PrimaryButton  : StyleB.PRIMARY,
  DangerButton   : StyleB.DANGER,
  SuccessButton  : StyleB.SUCCESS,
};


export const toVirtual = (cv: T) => {
  const {_tag, ref = NONE, mod = NONE, auth, onClick, ...data} = cv;

  if (_tag in styleMap) {
    (data as mut<opt<RestButton>>).style ??= styleMap[_tag as keyof typeof styleMap];
  }

  return TypeMap[_tag]({
    auths  : auth ?? [],
    data   : data as never,
    onClick: onClick as never,
    ref,
    mod,
  });
};
