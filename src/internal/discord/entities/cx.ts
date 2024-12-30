import {setSelectedOptions} from '#discord/entities/basic/component-data.ts';
import {DeveloperError} from '#discord/entities/errors/developer-error.ts';
import {updateRxRefs} from '#discord/entities/hooks/use-rest-ref.ts';
import {CxPath} from '#discord/entities/routing/cx-path.ts';
import {type ManagedOp, type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, type RestDataComponent, type RestDataDialog, type RestDataResolved, type RestRow, type SelectOp, StyleB, StyleT, TypeC} from '#pure/dfx';
import {Ar, D, p, pipe} from '#src/internal/pure/effect.ts';
import type {nopt, nro, num, opt, str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types';
import type {Component} from 'dfx/types';
import {NONE} from './constants/path';


export type Path = CxPath;
export const Path = CxPath;


type Meta<A, B> = {
  route   : CxPath;
  data    : nro<A>;
  onClick?: (values: B[]) => void | AnyE<void>;
};
export type E = {
  Button : Meta<OptButton, never>;
  Link   : Meta<OptButton, never>;
  Select : Meta<OptSelect, SelectOp>;
  User   : Meta<OptUser, ManagedOp>;
  Role   : Meta<OptRole, ManagedOp>;
  Channel: Meta<OptChannel, ManagedOp>;
  Mention: Meta<OptMention, ManagedOp>;
  Text   : Meta<OptText, never>;
};
export type Type = D.TaggedEnum<E>;
export type Tag = Type['_tag'];


export const Enum  = D.taggedEnum<Type>();
export const is    = Enum.$is;
export const match = Enum.$match;


export const ButtonTag  = 'Button' satisfies Tag;
export const LinkTag    = 'Link' satisfies Tag;
export const SelectTag  = 'Select' satisfies Tag;
export const UserTag    = 'User' satisfies Tag;
export const RoleTag    = 'Role' satisfies Tag;
export const ChannelTag = 'Channel' satisfies Tag;
export const MentionTag = 'Mention' satisfies Tag;
export const TextTag    = 'Text' satisfies Tag;


export const Button  = Enum.Button;
export const Link    = Enum.Link;
export const Select  = Enum.Select;
export const User    = Enum.User;
export const Role    = Enum.Role;
export const Channel = Enum.Channel;
export const Mention = Enum.Mention;
export const Text    = Enum.Text;


export const isButton  = is('Button');
export const isLink    = is('Link');
export const isSelect  = is('Select');
export const isUser    = is('User');
export const isRole    = is('Role');
export const isChannel = is('Channel');
export const isMention = is('Mention');
export const isText    = is('Text');


export const Tags: { [k in Type['_tag']]: k } = {
  Button : 'Button',
  Link   : 'Link',
  Select : 'Select',
  User   : 'User',
  Role   : 'Role',
  Channel: 'Channel',
  Mention: 'Mention',
  Text   : 'Text',
};


export const pure    = <A extends Type>(self: A) => self;
export const map     = <A extends Type, B = A>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapSame = <A extends Type>(fa: (a: A) => A) => (a: A) => fa(a);
export const get     = <A extends Type, B extends keyof A>(b: B) => (a: A): A[B] => a[b];
export const set     = <A extends Type, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;


export const buildId = map((cx) => ({...cx, data: {...cx.data, custom_id: CxPath.build(cx.route)}} as typeof cx));
export const merge   = <A extends Type>(a: opt<A>) => (b: A) => ({...b, ...a});


const decodeMap = {
  [TypeC.TEXT_INPUT]        : Text,
  [TypeC.STRING_SELECT]     : Select,
  [TypeC.USER_SELECT]       : User,
  [TypeC.ROLE_SELECT]       : Role,
  [TypeC.CHANNEL_SELECT]    : Channel,
  [TypeC.MENTIONABLE_SELECT]: Mention,
};


export const decode = (rx_cx: Component) => {
  const route = 'custom_id' in rx_cx
    ? Path.parse(rx_cx.custom_id)
    : Path.empty();

  if (rx_cx.type in decodeMap) {
    return decodeMap[rx_cx.type as keyof typeof decodeMap]({
      route,
      data: rx_cx as never,
    });
  }

  if (rx_cx.type === TypeC.BUTTON) {
    return 'custom_id' in rx_cx
      ? Button({
        route,
        data: rx_cx as never,
      })
      : Link({
        route,
        data: {
          ...rx_cx,
          custom_id: NONE,
        },
      });
  }

  return Button({
    route,
    data: {
      ...rx_cx,
      custom_id: NONE,
    } as never,
  });
};


export const encode = match({
  Button : ({data}) => data,
  Link   : ({data: {custom_id, ...data}}) => data,
  Select : ({data}) => data,
  User   : ({data}) => data,
  Role   : ({data}) => data,
  Channel: ({data}) => data,
  Mention: ({data}) => data,
  Text   : ({data}) => data,
});


export const makeFromView = <A extends Type>(cx: A) => {
  if (is('Link')(cx)) {
    cx.data.style ??= StyleB.LINK;
  }
  if (is('Button')(cx)) {
    cx.data.style ??= StyleB.PRIMARY;
  }
  if (is('Text')(cx)) {
    cx.data.style ??= StyleT.SHORT;
  }
  return cx;
};


export const mapFromDiscordRest = <A>(fa: (a: Component, row: num, col: num) => A) => (cs: Component[]) => pipe(
  cs as RestRow[],
  Ar.map((r, row) => pipe(
    r.components,
    Ar.map((c, col) => fa(c, row, col)),
  )),
);


export const makeGrid = (
  vxcx: Type[][],
  data: RestDataDialog | RestDataComponent,
  ax: CxPath,
  rx?: Type[][],
) => {
  const txcx = rx
    ? updateRxRefs(vxcx, rx)
    : vxcx;


  return p(txcx, Ar.map((cxs, row) => ({
    type      : TypeC.ACTION_ROW,
    components: p(cxs, Ar.map((cx, col) => {
      if (row > 5) {
        throw new DeveloperError({
          message: 'No more than 5 rows allowed',
        });
      }
      if (col > 5) {
        throw new DeveloperError({
          message: 'No more than 5 columns allowed',
        });
      }

      return p(
        cx,
        set('route', {
          ...cx.route,
          row: row,
          col: col,
        }),
        buildId,
        row === ax.row && col === ax.col
          ? setSelectedOptions(
            'values' in data ? data.values as unknown as str[] : [],
            'resolved' in data ? data.resolved as nopt<RestDataResolved> : undefined,
          )
          : pure,
        encode,
      );
    })),
  }))) as unknown as Component[];
};
