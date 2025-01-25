import {D} from '#pure/effect';
import type {str} from 'src/internal/pure/types-pure.ts';



export type T = D.TaggedEnum<{
  Select : {value: str; label: str; description?: str; default?: boolean};
  User   : {type: 'user'; id: str};
  Role   : {type: 'role'; id: str};
  Channel: {type: 'channel'; id: str};
}>;

export type Select = D.TaggedEnum.Value<T, 'Select'>;
export type User = D.TaggedEnum.Value<T, 'User'>;
export type Role = D.TaggedEnum.Value<T, 'Role'>;
export type Channel = D.TaggedEnum.Value<T, 'Channel'>;
export type Mention = User | Role | Channel;

export const T = D.taggedEnum<T>();

export const Select  = T.Select;
export const User    = T.User;
export const Role    = T.Role;
export const Channel = T.Channel;

export const isSelect  = T.$is('Select');
export const isUser    = T.$is('User');
export const isRole    = T.$is('Role');
export const isChannel = T.$is('Channel');


export type Managed = User | Role | Channel;


export const isManaged = (cv: T): cv is User | Role | Channel => isUser(cv) || isRole(cv) || isChannel(cv);
