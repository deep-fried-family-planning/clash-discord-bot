import type {E} from '#pure/effect';
import {D} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Cm, DA, Rf} from 'src/internal/disreact/virtual/entities/index.ts';
import type {Auth} from 'src/internal/disreact/virtual/kinds/index.ts';
import {Err} from 'src/internal/disreact/virtual/kinds/index.ts';
import {ComponentRoute} from 'src/internal/disreact/virtual/route/index.ts';



export type OnClickFn<A, B> = (
  event: {
    target: A;
    values: B[];
  },
) => void | E.Effect<void>;


export type T = D.TaggedEnum<{
  Button       : {auths?: Auth.T[]; ref?: Rf.T; onClick?: OnClickFn<DA.Button, str>} & Cm.Button['data'];
  Select       : {auths?: Auth.T[]; ref?: Rf.T; onClick?: OnClickFn<DA.Select, str>} & Cm.Select['data'];
  UserSelect   : {auths?: Auth.T[]; ref?: Rf.T; onClick?: OnClickFn<DA.UserSelect, str>} & Cm.UserSelect['data'];
  RoleSelect   : {auths?: Auth.T[]; ref?: Rf.T; onClick?: OnClickFn<DA.RoleSelect, str>} & Cm.RoleSelect['data'];
  ChannelSelect: {auths?: Auth.T[]; ref?: Rf.T; onClick?: OnClickFn<DA.ChannelSelect, str>} & Cm.ChannelSelect['data'];
  MentionSelect: {auths?: Auth.T[]; ref?: Rf.T; onClick?: OnClickFn<DA.MentionSelect, str>} & Cm.MentionSelect['data'];
  Text         : {auths?: Auth.T[]; ref?: Rf.T; onClick?: OnClickFn<DA.Text, str>} & Cm.Text['data'];
}>;

export type Button = D.TaggedEnum.Value<T, 'Button'>;
export type Select = D.TaggedEnum.Value<T, 'Select'>;
export type UserSelect = D.TaggedEnum.Value<T, 'UserSelect'>;
export type RoleSelect = D.TaggedEnum.Value<T, 'RoleSelect'>;
export type ChannelSelect = D.TaggedEnum.Value<T, 'ChannelSelect'>;
export type MentionSelect = D.TaggedEnum.Value<T, 'MentionSelect'>;
export type Text = D.TaggedEnum.Value<T, 'Text'>;

export const T = D.taggedEnum<T>();

export const Row = (...cis: T[]) => [...cis];

export const Button          = T.Button;
export const SuccessButton   = (p: Omit<Button, '_tag'>) => T.Button({...p, style: DA.En.Button.SUCCESS});
export const PrimaryButton   = (p: Omit<Button, '_tag'>) => T.Button({...p, style: DA.En.Button.PRIMARY});
export const SecondaryButton = (p: Omit<Button, '_tag'>) => T.Button({...p, style: DA.En.Button.SECONDARY});
export const DangerButton    = (p: Omit<Button, '_tag'>) => T.Button({...p, style: DA.En.Button.DANGER});
export const LinkButton      = (p: Omit<Button, '_tag'>) => T.Button({...p, style: DA.En.Button.LINK});
export const PremiumButton   = (p: Omit<Button, '_tag'>) => T.Button({...p, style: DA.En.Button.PREMIUM});
export const Select          = (p: Omit<Select, '_tag'>) => [T.Select(p)];
export const UserSelect      = (p: Omit<UserSelect, '_tag'>) => [T.UserSelect(p)];
export const RoleSelect      = (p: Omit<RoleSelect, '_tag'>) => [T.RoleSelect(p)];
export const ChannelSelect   = (p: Omit<ChannelSelect, '_tag'>) => [T.ChannelSelect(p)];
export const MentionSelect   = (p: Omit<MentionSelect, '_tag'>) => [T.MentionSelect(p)];
export const Text            = (p: Omit<Text, '_tag'>) => [T.Text(p)];


const models = {
  Button         : Cm.Button,
  SuccessButton  : Cm.Button,
  PrimaryButton  : Cm.Button,
  SecondaryButton: Cm.Button,
  DangerButton   : Cm.Button,
  LinkButton     : Cm.Button,
  PremiumButton  : Cm.Button,

  Select: Cm.Select,

  UserSelect   : Cm.UserSelect,
  RoleSelect   : Cm.RoleSelect,
  ChannelSelect: Cm.ChannelSelect,
  MentionSelect: Cm.MentionSelect,
  Text         : Cm.Text,
};


export const asModel = (ci: T): Cm.T => {
  const {_tag, auths = [], ref = Rf.Default(), onClick, ...data} = ci;

  if (!(_tag in models)) {
    throw new Err.Critical();
  }

  const route      = ComponentRoute.empty();
  route.params.ref = Rf.encode(ref);

  return models[_tag]({
    auths,
    route,
    ref,
    onClick: onClick as never,
    data   : data as never,
  });
};


export const modelAll = (cis: T[][]): Cm.T[][] => cis.map((row) => row.map(asModel));
