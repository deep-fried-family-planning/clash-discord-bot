import type {ButtonProps, SelectMenuProps} from '#src/disreact/model/dsx/intrinsic.ts';



export type ButtonClickEvent = {
  _tag  : 'ButtonClickEvent';
  target: ButtonProps;
};

export type SelectMenuClickEvent = {
  _tag  : 'SelectMenuClickEvent';
  target: SelectMenuProps;
};

export type UserMenuClickEvent = {
  _tag  : 'UserMenuClickEvent';
  target: SelectMenuProps;
  values: {id: string; type: 'user'}[];
};

export type RoleMenuClickEvent = {
  _tag  : 'RoleMenuClickEvent';
  target: SelectMenuProps;
  values: {id: string; type: 'role'}[];
};

export type ChannelMenuClickEvent = {
  _tag  : 'ChannelMenuClickEvent';
  values: {id: string; type: 'channel'}[];
};

export type MentionMenuClickEvent = {
  _tag  : 'MentionMenuClickEvent';
  values: {id: string; type: 'user' | 'role' | 'channel'}[];
};
