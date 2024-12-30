import {NONE_NUM} from '#discord/entities/constants/constants.ts';
import {CxPath} from '#discord/entities/routing/cx-path.ts';
import {type ManagedOp, type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, type RestComponent, type RestDataResolved, type RestRow, type SelectOp, StyleB, StyleT, TypeC} from '#pure/dfx';
import {D, flow, pipe} from '#pure/effect';
import type {snow} from '#src/discord/types.ts';
import type {Mutable, nopt, num, str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type OnClick<T, O> = (
  event: {
    target  : T;
    selected: str[];
    values  : O[];
    options : O[];
  },
) => void | AnyE<void>;


export type Path = CxPath;
export type Meta = {
  path: Path;
};
export type E = {
  Button : Meta & {onClick?: OnClick<Mutable<OptButton>, never>; data: Mutable<OptButton>};
  Link   : Meta & {onClick?: OnClick<Mutable<OptButton>, never>; data: Mutable<OptButton>};
  Premium: Meta & {onClick?: OnClick<Mutable<OptButton>, never>; data: Mutable<OptButton>};
  Select : Meta & {onClick?: OnClick<Mutable<OptSelect>, SelectOp>; data: Mutable<OptSelect>};
  User   : Meta & {onClick?: OnClick<Mutable<OptUser>, ManagedOp>; data: Mutable<OptUser>};
  Role   : Meta & {onClick?: OnClick<Mutable<OptRole>, ManagedOp>; data: Mutable<OptRole>};
  Channel: Meta & {onClick?: OnClick<Mutable<OptChannel>, ManagedOp>; data: Mutable<OptChannel>};
  Mention: Meta & {onClick?: OnClick<Mutable<OptMention>, ManagedOp>; data: Mutable<OptMention>};
  Text   : Meta & {onClick?: OnClick<Mutable<OptText>, never>; data: Mutable<OptText>};
};
export type T = D.TaggedEnum<E>;
export type Grid = T[][];


export const E        = D.taggedEnum<T>();
export const Path     = CxPath;
export const is       = E.$is;
export const match    = E.$match;
export const pure     = <A extends T>(a: A) => a;
export const pureGrid = (a: Grid) => a;
export const get      = <A extends T, B extends keyof A>(b: B) => (a: A): A[B] => a[b];
export const set      = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const setWith  = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const map      = <A extends T>(fa: (a: A) => A) => (a: A) => fa(a);
export const mapTo    = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapGrid  = (fa: (a: T, row: num, col: num) => T) => (grid: Grid) => grid.map((row, rowIdx) => row.map((cx, colIdx) => fa(cx, rowIdx, colIdx)));


export const Button  = E.Button;
export const Link    = E.Link;
export const Premium = E.Premium;
export const Select  = E.Select;
export const User    = E.User;
export const Role    = E.Role;
export const Channel = E.Channel;
export const Mention = E.Mention;
export const Text    = E.Text;


export const DecodeTypeMap = {
  [TypeC.TEXT_INPUT]        : Text,
  [TypeC.STRING_SELECT]     : Select,
  [TypeC.USER_SELECT]       : User,
  [TypeC.ROLE_SELECT]       : Role,
  [TypeC.CHANNEL_SELECT]    : Channel,
  [TypeC.MENTIONABLE_SELECT]: Mention,
};

export const decode = (rest: RestComponent, row?: num, col?: num) => {
  const route = pipe(
    'custom_id' in rest ? CxPath.parse(rest.custom_id) : CxPath.empty(),
    CxPath.set('row', row ?? NONE_NUM),
    CxPath.set('col', col ?? NONE_NUM),
  );

  if (rest.type in DecodeTypeMap) {
    return DecodeTypeMap[rest.type as keyof typeof DecodeTypeMap]({
      path: route,
      data: rest as never,
    });
  }
  if ((rest as OptButton).custom_id) {
    return Button({
      path: route,
      data: rest as OptButton,
    });
  }
  return Link({
    path: CxPath.empty(),
    data: rest as OptButton,
  });
};

export const decodeGrid = (rest: RestComponent[] = []) => rest.map((row, rowIdx) => (row as RestRow).components.map((rc, colIdx) => decode(rc, rowIdx, colIdx))) as Grid;


export const EncodeTypeMap = {
  Button : TypeC.BUTTON,
  Link   : TypeC.BUTTON,
  Premium: TypeC.BUTTON,
  Select : TypeC.STRING_SELECT,
  User   : TypeC.USER_SELECT,
  Role   : TypeC.ROLE_SELECT,
  Channel: TypeC.CHANNEL_SELECT,
  Mention: TypeC.MENTIONABLE_SELECT,
  Text   : TypeC.TEXT_INPUT,
};


export const encode = flow(
  match({
    Button : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleB.PRIMARY, custom_id: CxPath.build(cx.path)}),
    Link   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleB.LINK, custom_id: undefined}),
    Premium: (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleB.PREMIUM, custom_id: undefined}),
    Select : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: CxPath.build(cx.path)}),
    User   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: CxPath.build(cx.path)}),
    Role   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: CxPath.build(cx.path)}),
    Channel: (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: CxPath.build(cx.path)}),
    Mention: (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: CxPath.build(cx.path)}),
    Text   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleT.SHORT, custom_id: CxPath.build(cx.path)}),
  }),
  (data) => data as RestComponent,
);


export const encodeGrid = (
  path: Path,
) => (grid: Grid) => grid.map((row, rowIdx) => ({
  type      : TypeC.ACTION_ROW,
  components: row.map((cx, colIdx) => {
    cx.path.root = path.root;
    cx.path.view = path.view;
    cx.path.row  = rowIdx;
    cx.path.col  = colIdx;
    cx.path.mod  = path.mod;
    return encode(cx);
  }),
}) as RestRow) as RestComponent[];


export const getSelectedOptions = match({
  Button : () => [],
  Link   : () => [],
  Premium: () => [],
  Select : (cx) => cx.data.options?.filter((o) => o.default) ?? [],
  User   : (cx) => cx.data.default_values ?? [],
  Role   : (cx) => cx.data.default_values ?? [],
  Channel: (cx) => cx.data.default_values ?? [],
  Mention: (cx) => cx.data.default_values ?? [],
  Text   : () => [],
});


export const setSelectedOptions = (
  values: str[],
  resolved?: nopt<RestDataResolved>,
) => match({
  Button : pure,
  Link   : pure,
  Premium: pure,
  Select : (cx) => ({...cx, data: {...cx.data, options: cx.data.options!.map((o) => ({...o, default: values.includes(o.value)}))}}) as typeof cx,
  User   : (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v as snow, resolved)}))}}) as typeof cx,
  Role   : (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v as snow, resolved)}))}}) as typeof cx,
  Channel: (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v as snow, resolved)}))}}) as typeof cx,
  Mention: (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v as snow, resolved)}))}}) as typeof cx,
  Text   : pure,
});


export const getOptions = match({
  Button : () => [],
  Link   : () => [],
  Premium: () => [],
  Select : (cx) => cx.data.options ?? [],
  User   : (cx) => cx.data.default_values ?? [],
  Role   : (cx) => cx.data.default_values ?? [],
  Channel: (cx) => cx.data.default_values ?? [],
  Mention: (cx) => cx.data.default_values ?? [],
  Text   : () => [],
});


export const setOptions = match({
  Button : () => [],
  Link   : () => [],
  Premium: () => [],
  Select : (cx) => cx.data.options ?? [],
  User   : (cx) => cx.data.default_values ?? [],
  Role   : (cx) => cx.data.default_values ?? [],
  Channel: (cx) => cx.data.default_values ?? [],
  Mention: (cx) => cx.data.default_values ?? [],
  Text   : () => [],
});


const resolveType = (val: snow, resolved?: nopt<RestDataResolved>) =>
  resolved?.users?.[val] ? 'user'
    : resolved?.roles?.[val] ? 'role'
      : resolved?.channels?.[val] ? 'channel'
        : 'fail';
