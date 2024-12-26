import type {Cx, CxVR} from '#dfdis';
import {Const, Flags} from '#dfdis';
import {cxRouter} from '#discord/model-routing/ope.ts';
import {type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, StyleB, StyleT, TypeC} from '#pure/dfx';
import {D} from '#src/internal/pure/effect.ts';
import type {ne, nro, opt, str, und, unk} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';
import type {Component} from 'dfx/types';


export const enum Status {
  will_mount    = 'will_mount',
  mounted       = 'mounted',
  will_dismount = 'will_dismount',
  dismounted    = 'dismounted',
  unknown       = 'unknown',
  embed         = 'embed',
}


export type OnClickCtx<T> = {
  setView     : (view: unk) => void;
  setComponent: (cx: T) => void;
  dispatch    : (action: unk) => void;
};


type Meta<T> = {
  route   : CxVR.T;
  status  : Status;
  flags   : Flags.Id[];
  onClick?: und | ((cx: ne, ctx: ne) => void);
  data    : nro<T> & {custom_id: str};
};


export type E = {
  Button : Meta<OptButton>;
  Link   : Meta<OptButton>;
  Select : Meta<OptSelect>;
  User   : Meta<OptUser>;
  Role   : Meta<OptRole>;
  Channel: Meta<OptChannel>;
  Mention: Meta<OptMention>;
  Text   : Meta<OptText>;
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


export const pure = <A extends T>(self: A) => self;
export const map  = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const get  = <A extends T, B extends keyof A>(b: B) => (a: A): A[B] => a[b];
export const set  = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;

export const resolveFlags = map((cx) => ({...cx, flags: Flags.assignFlags(cx.route)}));
export const buildId      = map((cx) => ({...cx, data: {...cx.data, custom_id: cxRouter.build(cx.route)}} as typeof cx));
export const merge        = <A extends T>(a: opt<A>) => (b: A) => ({...b, ...a});
export const mergeData    = <A extends T>(a: A['data']) => (b: A) => ({
  ...b,
  data: {...b.data, ...a},
});
export const mergeMeta    = <A extends T>(a: A['data']) => (b: A) => ({
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


export const makeFromRest = (rest: Component) => {
  if (rest.type in makeMap) {
    return makeMap[rest.type as keyof typeof makeMap]({data: rest} as ne);
  }

  if (rest.type === Discord.ComponentType.BUTTON) {
    return 'custom_id' in rest
      ? C.Button({data: rest} as ne)
      : C.Link({data: {...rest, custom_id: Const.NONE}} as ne);
  }

  return C.Button({data: {...rest, custom_id: Const.NONE}} as ne);
};


export const defaultFromView = <A extends T>(cx: A) => {
  if (is('Link')(cx)) {
    return {
      ...cx,
      data: {
        ...cx,
        ...cx.data,
        style: StyleB.LINK,
      },
    };
  }
  if (is('Button')(cx)) {
    return {
      ...cx,
      data: {
        ...cx.data,
        style: cx.data.style ?? StyleB.PRIMARY,
      },
    };
  }
  if (is('Text')(cx)) {
    return {
      ...cx,
      data: {
        ...cx.data,
        style: cx.data.style ?? StyleT.SHORT,
      },
    };
  }
  return cx;
};
