import {type OptButton, type RestButton, type RestChannelSelect, type RestComponent, type RestDataComponent, type RestDataResolved, type RestMentionableSelect, type RestRoleSelect, type RestRow, type RestStringSelect, type RestText, type RestUserSelect, StyleB, StyleT, TypeC} from '#pure/dfx';
import {D, pipe} from '#pure/effect';
import type {snow} from '#src/discord/types.ts';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import type {Auth} from '#src/internal/disreact/entity/index.ts';
import {Route} from '#src/internal/disreact/entity/index.ts';
import {getRef} from '#src/internal/disreact/entity/route.ts';
import type {IxIn} from '#src/internal/disreact/entity/types/rx.ts';
import type {mut, Mutable, nopt, num, opt, str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type OnClick<T, O> = (
  event: {
    ix      : IxIn;
    target  : T;
    first   : str;
    selected: str[];
    values  : O[];
    options : O[];
  },
) => void | AnyE<void>;


type Common<A> = {
  data    : Mutable<opt<A>>;
  route?  : Route.T;
  onClick?: (event: unknown) => void | AnyE<void>;
  auths?  : Auth.T[];
  ref?    : str;
  mod?    : str;
};
export type T = D.TaggedEnum<{
  Button : Common<RestButton>;
  Link   : Common<RestButton>;
  Premium: Common<RestButton>;
  Select : Common<RestStringSelect>;
  User   : Common<RestUserSelect>;
  Role   : Common<RestRoleSelect>;
  Channel: Common<RestChannelSelect>;
  Mention: Common<RestMentionableSelect>;
  Text   : Common<RestText>;
}>;
export type Button = D.TaggedEnum.Value<T, 'Button'>;
export type Link = D.TaggedEnum.Value<T, 'Link'>;
export type Premium = D.TaggedEnum.Value<T, 'Premium'>;
export type Select = D.TaggedEnum.Value<T, 'Select'>;
export type User = D.TaggedEnum.Value<T, 'User'>;
export type Role = D.TaggedEnum.Value<T, 'Role'>;
export type Channel = D.TaggedEnum.Value<T, 'Channel'>;
export type Mention = D.TaggedEnum.Value<T, 'Mention'>;
export type Text = D.TaggedEnum.Value<T, 'Text'>;


export const T       = D.taggedEnum<T>();
export const is      = T.$is;
export const match   = T.$match;
export const mapGrid = (fa: (a: T, row: num, col: num) => T) => (grid: T[][]) => grid.map((row, rowIdx) => row.map((cx, colIdx) => fa(cx, rowIdx, colIdx)));


export const button    = T.Button;
export const link      = T.Link;
export const premium   = T.Premium;
export const select    = T.Select;
export const user      = T.User;
export const role      = T.Role;
export const channel   = T.Channel;
export const mention   = T.Mention;
export const text      = T.Text;


const DecodeTypeMap = {
  [TypeC.TEXT_INPUT]        : text,
  [TypeC.STRING_SELECT]     : select,
  [TypeC.USER_SELECT]       : user,
  [TypeC.ROLE_SELECT]       : role,
  [TypeC.CHANNEL_SELECT]    : channel,
  [TypeC.MENTIONABLE_SELECT]: mention,
};


export const decode = (rest: RestComponent, row: num, col: num) => {
  const route = pipe(
    Route.decode(rest.custom_id) ?? Route.Component.empty(),
    Route.setRow(row),
    Route.setCol(col),
  );

  const ref   = getRef(route);
  const data = rest as never;

  if (rest.type in DecodeTypeMap) {
    return DecodeTypeMap[rest.type as keyof typeof DecodeTypeMap]({
      route,
      data,
      ref,
    });
  }
  if ((rest as OptButton).custom_id) {
    return button({
      route,
      data,
      ref,
    });
  }
  return link({
    route: Route.Component.empty(),
    data,
    ref,
  });
};

export const decodeGrid = (rest: RestComponent[] = []) => rest.map((row, rowIdx) => (row as RestRow).components.map((rc, colIdx) => decode(rc, rowIdx, colIdx))) as T[][];


const EncodeTypeMap = {
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


export const encode = match({
  Button : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleB.PRIMARY, custom_id: Route.encode(cx.route!)}),
  Link   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleB.LINK, custom_id: undefined}),
  Premium: (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleB.PREMIUM, custom_id: undefined}),
  Select : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: Route.encode(cx.route!)}),
  User   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: Route.encode(cx.route!)}),
  Role   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: Route.encode(cx.route!)}),
  Channel: (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: Route.encode(cx.route!)}),
  Mention: (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], custom_id: Route.encode(cx.route!)}),
  Text   : (cx) => ({...cx.data, type: EncodeTypeMap[cx._tag], style: cx.data.style ?? StyleT.SHORT, custom_id: Route.encode(cx.route!)}),
});


export const encodeGrid = (grid: T[][]) => grid.map((row, rowIdx) => ({
  type      : TypeC.ACTION_ROW,
  components: row.map((cx, colIdx) => pipe(
    cx,
    Route.setRouted(pipe(
      Route.Component.empty(),
      Route.setRef(cx.ref ?? NONE),
      Route.setRow(rowIdx),
      Route.setCol(colIdx),
      Route.setMod(cx.mod ?? NONE),
    )),
    encode,
  )),
}) as RestRow) as RestComponent[];


export const getSelectedOptions = match({
  Button : () => [],
  Link   : () => [],
  Premium: () => [],
  Select : (cx) => cx.data.options!.filter((o) => o.default),
  User   : (cx) => cx.data.default_values!,
  Role   : (cx) => cx.data.default_values!,
  Channel: (cx) => cx.data.default_values!,
  Mention: (cx) => cx.data.default_values!,
  Text   : () => [],
});


export const getSelectedValues = match({
  Button : () => [],
  Link   : () => [],
  Premium: () => [],
  Select : (cx) => cx.data.options!.filter((o) => o.default).map((o) => o.value),
  User   : (cx) => cx.data.default_values!.map((v) => v.id),
  Role   : (cx) => cx.data.default_values!.map((v) => v.id),
  Channel: (cx) => cx.data.default_values!.map((v) => v.id),
  Mention: (cx) => cx.data.default_values!.map((v) => v.id),
  Text   : () => [],
});


export const setSelectedOptions = (data: RestDataComponent) => (cx: T) => {
  // if (target.params.row !== cx.route.params.row || target.params.col !== cx.route.params.col) {
  //   return cx;
  // }

  const values   = data.values ?? [];
  const resolved = data.resolved as nopt<RestDataResolved>;

  return match({
    Button : (cx) => cx,
    Link   : (cx) => cx,
    Premium: (cx) => cx,
    Select : (cx) => ({...cx, data: {...cx.data, options: cx.data.options!.map((o) => ({...o, default: values.includes(o.value)}))}}) as typeof cx,
    User   : (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v, resolved)}))}}) as typeof cx,
    Role   : (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v, resolved)}))}}) as typeof cx,
    Channel: (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v, resolved)}))}}) as typeof cx,
    Mention: (cx) => ({...cx, data: {...cx.data, default_values: values.map((v) => ({id: v as snow, type: resolveType(v, resolved)}))}}) as typeof cx,
    Text   : (cx) => cx,
  })(cx);
};


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


export const setOptions = () => match({
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


const resolveType = (value: str, resolved?: nopt<RestDataResolved>) => {
  const val = value as snow;

  return resolved?.users?.[val] ? 'user'
    : resolved?.roles?.[val] ? 'role'
      : resolved?.channels?.[val] ? 'channel'
        : 'fail';
};


export const setRoute = (route: Route.T) => (cd: T) => {
  (cd as mut<T>).route = Route.clone(route);
  return cd;
};
