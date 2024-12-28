import type {Cx} from '#dfdis';
import {Const} from '#dfdis';
import {CxPath} from '#discord/routing/cx-path.ts';
import {type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, type RestRow, StyleB, StyleT, TypeC} from '#pure/dfx';
import {Ar, D, pipe} from '#src/internal/pure/effect.ts';
import type {nro, num, opt} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';
import type {Component} from 'dfx/types';


type Meta<A, K extends keyof E> = {
  route   : CxPath;
  data    : nro<A>;
  onClick?: (event: Omit<E[K], 'onClick'>) => void;
};


export type E = {
  Button : Meta<OptButton, 'Button'>;
  Link   : Meta<OptButton, 'Link'>;
  Select : Meta<OptSelect, 'Select'>;
  User   : Meta<OptUser, 'User'>;
  Role   : Meta<OptRole, 'Role'>;
  Channel: Meta<OptChannel, 'Channel'>;
  Mention: Meta<OptMention, 'Mention'>;
  Text   : Meta<OptText, 'Text'>;
};

export type T = D.TaggedEnum<E>;


export const C     = D.taggedEnum<T>();
export const is    = C.$is;
export const match = C.$match;


export const {Button, Link, Select, User, Role, Channel, Mention, Text} = C;

export const Tag: { [k in Cx.T['_tag']]: k } = {
  Button : 'Button',
  Link   : 'Link',
  Select : 'Select',
  User   : 'User',
  Role   : 'Role',
  Channel: 'Channel',
  Mention: 'Mention',
  Text   : 'Text',
};


export const pure    = <A extends T>(self: A) => self;
export const map     = <A extends T, B = A>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapSame = <A extends T>(fa: (a: A) => A) => (a: A) => fa(a);
export const get     = <A extends T, B extends keyof A>(b: B) => (a: A): A[B] => a[b];
export const set     = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;

export const buildId = map((cx) => ({...cx, data: {...cx.data, custom_id: CxPath.build(cx.route)}} as typeof cx));
export const merge   = <A extends T>(a: opt<A>) => (b: A) => ({...b, ...a});


export const mergeData = <A extends T>(a: A['data']) => (b: A) => ({
  ...b,
  data: {...b.data, ...a},
});
export const mergeMeta = <A extends T>(a: A['data']) => (b: A) => ({
  ...b,
  data: {...b.data, ...a},
});


export const getSelected = C.$match({
  Button : () => [],
  Link   : () => [],
  Select : (cx) => cx.data.options!.filter((o) => o.default),
  User   : (cx) => cx.data.default_values,
  Role   : (cx) => cx.data.default_values,
  Channel: (cx) => cx.data.default_values,
  Mention: (cx) => cx.data.default_values,
  Text   : () => [],
});


const makeMap = {
  [TypeC.TEXT_INPUT]        : C.Text,
  [TypeC.STRING_SELECT]     : C.Select,
  [TypeC.USER_SELECT]       : C.User,
  [TypeC.ROLE_SELECT]       : C.Role,
  [TypeC.CHANNEL_SELECT]    : C.Channel,
  [TypeC.MENTIONABLE_SELECT]: C.Mention,
};


export const makeFromRest = (rx_cx: Component) => {
  const route = 'custom_id' in rx_cx
    ? CxPath.parse(rx_cx.custom_id)
    : CxPath.empty();

  if (rx_cx.type in makeMap) {
    return makeMap[rx_cx.type as keyof typeof makeMap]({
      route,
      data: rx_cx as never,
    });
  }

  if (rx_cx.type === Discord.ComponentType.BUTTON) {
    return 'custom_id' in rx_cx
      ? C.Button({
        route,
        data: rx_cx as never,
      })
      : C.Link({
        route,
        data: {
          ...rx_cx,
          custom_id: Const.NONE,
        },
      });
  }

  return C.Button({
    route,
    data: {
      ...rx_cx,
      custom_id: Const.NONE,
    } as never,
  });
};


export const defaultFromView = <A extends T>(vx_cx: A) => {
  if (is('Link')(vx_cx)) {
    return {
      ...vx_cx,
      data: {
        ...vx_cx,
        ...vx_cx.data,
        style: StyleB.LINK,
      },
    };
  }
  if (is('Button')(vx_cx)) {
    return {
      ...vx_cx,
      data: {
        ...vx_cx.data,
        style: vx_cx.data.style ?? StyleB.PRIMARY,
      },
    };
  }
  if (is('Text')(vx_cx)) {
    return {
      ...vx_cx,
      data: {
        ...vx_cx.data,
        style: vx_cx.data.style ?? StyleT.SHORT,
      },
    };
  }
  return vx_cx;
};


export const mapFromData = <A>(fa: (a: Component, row: num, col: num) => A) => (cs: Component[]) => pipe(
  cs as RestRow[],
  Ar.map((r, row) => pipe(
    r.components,
    Ar.map((c, col) => fa(c, row, col)),
  )),
);
