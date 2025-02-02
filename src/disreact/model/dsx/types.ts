/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {DAction} from '#src/disreact/runtime/enum/index.ts';
import type {E} from '#src/internal/pure/effect.ts';

type s0t4000 = string;
type s0t150 = string;
type s0t80 = string;
type s1t100 = string;
type s1t45 = string;
type s1t34 = string;
type s1t32 = string;
type i1t25 = number;
type i1t6000 = number;
type i0t6000 = number;
type n1t4000 = number;
type n0t4000 = number;

type Handler<Event> = (event: Event) => void | E.Effect<void>;

export type DTMLChildren<C> = C | C[];

export type DTMLEmojiElement =
  | {name: string};

export type DTMLSlashCommandElement = {
  command                   : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  children?                 : DTMLSlashSubGroupElement[] | DTMLSlashSubCommandElement[];
};
export type DTMLSlashSubGroupElement = {
  subgroup                  : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
};
export type DTMLSlashSubCommandElement = {
  subcommand                : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
};
export type DTMLCommandElement =
  | DTMLSlashCommandElement
  | DTMLSlashSubGroupElement
  | DTMLSlashSubCommandElement;



export type DTMLStringParameterElement = {
  string                    : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  choices?                  : DTMLStringChoiceElement[];
  min_length?               : i0t6000;
  max_length?               : i1t6000;
  autocomplete?             : boolean;
  onAutoComplete?           : Handler<DAction.CommandAutoComplete>;
  children?                 : DTMLStringChoiceElement[];
};
export type DTMLIntegerParameterElement = {
  integer                   : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  choices?                  : DTMLIntegerChoiceElement[];
  min_value?                : number;
  max_value?                : number;
  autocomplete?             : boolean;
  onAutoComplete?           : Handler<DAction.CommandAutoComplete>;
  children?                 : DTMLIntegerChoiceElement[];
};
export type DTMLNumberParameterElement = {
  number                    : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  required?                 : boolean;
  choices?                  : DTMLNumberChoiceElement[];
  min_value?                : number;
  max_value?                : number;
  autocomplete?             : boolean;
  onAutoComplete?           : Handler<DAction.CommandAutoComplete>;
  children?                 : DTMLNumberChoiceElement[];
};
export type DTMLBooleanParameterElement = {
  boolean                   : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  required?                 : boolean;
};
export type DTMLAttachmentParameterElement = {
  attachment                : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  required?                 : boolean;
};
export type DTMLUserParameterElement = {
  $user                     : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  required?                 : boolean;
};
export type DTMLRoleParameterElement = {
  role                      : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  required?                 : boolean;
};
export type DTMLChannelParameterElement = {
  channel                   : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  required?                 : boolean;
  channel_types?            : number[];
};
export type DTMLMentionParameterElement = {
  mention                   : boolean;
  name                      : s1t32;
  description               : s1t100;
  name_localizations?       : Record<string, s1t100>;
  description_localizations?: Record<string, s1t100>;
  required?                 : boolean;
};
export type DTMLParameterElement =
  | DTMLStringParameterElement
  | DTMLIntegerParameterElement
  | DTMLNumberParameterElement
  | DTMLBooleanParameterElement
  | DTMLAttachmentParameterElement
  | DTMLUserParameterElement
  | DTMLRoleParameterElement
  | DTMLChannelParameterElement
  | DTMLMentionParameterElement;



export type DTMLStringChoiceElement = {
  string             : boolean;
  name               : s1t100;
  name_localizations?: Record<string, s1t100>;
  value              : s1t100;
};
export type DTMLIntegerChoiceElement = {
  integer            : boolean;
  name               : s1t100;
  name_localizations?: Record<string, s1t100>;
  value              : number;
};
export type DTMLNumberChoiceElement = {
  number             : boolean;
  name               : s1t100;
  name_localizations?: Record<string, s1t100>;
  value              : number;
};
export type DTMLChoiceElement =
  | DTMLStringChoiceElement
  | DTMLIntegerChoiceElement
  | DTMLNumberChoiceElement;



export type DTMLSuccessButtonElement = {
  success   : boolean;
  custom_id?: s1t100;
  label?    : s0t80;
  emoji?    : DTMLEmojiElement;
  disabled? : boolean;
  onClick?  : Handler<DAction.ButtonClick>;
  children? : DTMLEmojiElement;
};
export type DTMLDangerButtonElement = {
  danger    : boolean;
  custom_id?: s1t100;
  label?    : s0t80;
  emoji?    : DTMLEmojiElement;
  disabled? : boolean;
  onClick?  : Handler<DAction.ButtonClick>;
  children? : DTMLEmojiElement;
};
export type DTMLPrimaryButtonElement = {
  primary   : boolean;
  custom_id?: s1t100;
  label?    : s0t80;
  emoji?    : DTMLEmojiElement;
  disabled? : boolean;
  onClick?  : Handler<DAction.ButtonClick>;
  children? : DTMLEmojiElement;
};
export type DTMLSecondaryButtonElement = {
  secondary : boolean;
  custom_id?: s1t100;
  label?    : s0t80;
  emoji?    : DTMLEmojiElement;
  disabled? : boolean;
  onClick?  : Handler<DAction.ButtonClick>;
  children? : DTMLEmojiElement;
};
export type DTMLLinkButtonElement = {
  link     : boolean;
  url      : string;
  label?   : s0t80;
  emoji?   : DTMLEmojiElement;
  disabled?: boolean;
  children?: DTMLEmojiElement;
};
export type DTMLPremiumButtonElement = {
  premium  : boolean;
  sku_id   : string;
  label?   : s1t34;
  emoji?   : DTMLEmojiElement;
  disabled?: boolean;
  children?: DTMLEmojiElement;
};
export type DTMLButtonElement =
  | DTMLSuccessButtonElement
  | DTMLDangerButtonElement
  | DTMLPrimaryButtonElement
  | DTMLSecondaryButtonElement
  | DTMLLinkButtonElement
  | DTMLPremiumButtonElement;



export type DTMLStringMenuElement = {
  string      : boolean;
  custom_id?  : s1t100;
  options?    : DTMLOptionElement[];
  placeholder?: s0t150;
  min_values? : i1t25;
  max_values? : i1t25;
  disabled?   : boolean;
  onClick?    : Handler<DAction.SelectClick>;
};
export type DTMLUserMenuElement = {
  user           : boolean;
  custom_id?     : s1t100;
  placeholder?   : s0t150;
  default_values?: DTMLUserValueElement[];
  disabled?      : boolean;
  onClick?       : Handler<DAction.UserClick>;
};
export type DTMLRoleMenuElement = {
  role           : boolean;
  custom_id?     : s1t100;
  placeholder?   : s0t150;
  default_values?: DTMLRoleValueElement[];
  disabled?      : boolean;
  onClick?       : Handler<DAction.RoleClick>;
};
export type DTMLChannelMenuElement = {
  channel        : boolean;
  custom_id?     : s1t100;
  channel_types? : number[];
  placeholder?   : s0t150;
  default_values?: DTMLChannelValueElement[];
  disabled?      : boolean;
  onClick?       : Handler<DAction.ChannelClick>;
};
export type DTMLMentionMenuElement = {
  mention     : boolean;
  custom_id?  : s1t100;
  placeholder?: s0t150;
  disabled?   : boolean;
  onClick?    : Handler<DAction.MentionClick>;
};
export type DTMLMenuElement =
  | DTMLStringMenuElement
  | DTMLUserMenuElement
  | DTMLRoleMenuElement
  | DTMLChannelMenuElement
  | DTMLMentionMenuElement;



export type DTMLOptionElement = {
  string      : boolean;
  label       : s1t100;
  value       : s1t100;
  description?: s1t100;
  emoji?      : DTMLEmojiElement;
  default?    : boolean;
};



export type DTMLUserValueElement = {
  user: boolean;
  id  : string;
};
export type DTMLChannelValueElement = {
  channel: string;
  id     : string;
};
export type DTMLRoleValueElement = {
  role: boolean;
  id  : string;
};
export type DTMLValueElement =
  | DTMLUserValueElement
  | DTMLChannelValueElement
  | DTMLRoleValueElement;



export type DTMLTextElement = {
  paragraph?  : boolean;
  custom_id?  : s1t100;
  label       : s1t45;
  placeholder?: s0t150;
  value?      : s0t4000;
  min_length? : n0t4000;
  max_length? : n1t4000;
  required?   : boolean;
};



export type DTMLComponentRowElement = {
  children: DTMLButtonElement | DTMLButtonElement[];
};


export type DTMLEmbedElement = {
  color?  : number | string;
  children: DTMLEmbedDescriptionElement[];
};
export type DTMLEmbedTitleElement = {};
export type DTMLEmbedDescriptionElement = {};
export type DTMLEmbedFieldElement = {};
export type DTMLEmbedFooterElement = {};


export type DTMLMessageContentElement = {};
export type DTMLPublicMessageElement = {
  public    : boolean;
  custom_id?: s1t100;
};
export type DTMLEphemeralMessageElement = {
  ephemeral : boolean;
  custom_id?: s1t100;
  children? : DTMLChildren<DTMLMessageContentElement | DTMLComponentRowElement | DTMLMenuElement | DTMLEmbedElement>;
};
export type DTMLMessageElement =
  | DTMLPublicMessageElement
  | DTMLEphemeralMessageElement;



export type DTMLModalElement = {
  custom_id?: s1t100;
  title     : s1t45;
  onSubmit? : Handler<DAction.MessageSubmit>;
};



export type DTMLUserMentionElement = {
  user: boolean;
  id  : string;
};
export type DTMLRoleMentionElement = {
  role: boolean;
  id  : string;
};
export type DTMLChannelMentionElement = {
  channel: boolean;
  id     : string;
};
export type DTMLEveryoneMentionElement = {
  everyone: boolean;
};
export type DTMLHereMentionElement = {
  here: boolean;
};
export type DFMDMentionElement =
  | DTMLUserMentionElement
  | DTMLRoleMentionElement
  | DTMLChannelMentionElement
  | DTMLEveryoneMentionElement
  | DTMLHereMentionElement;



export type DFMDAnchorElement = {
  embed?: boolean;
  href  : string;
};
export type DFMDNestedElement =
  | DFMDAnchorElement
  | DFMDElement;
export type DFMDElement = {
  children: string | DFMDNestedElement[];
};



export type DTMLElement =
  | DTMLCommandElement
  | DTMLParameterElement
  | DTMLButtonElement
  | DTMLMenuElement
  | DTMLTextElement
  | DTMLMessageElement
  | DTMLModalElement
  | DTMLEmbedElement
  | DTMLUserMentionElement
  | DTMLRoleMentionElement
  | DTMLChannelMentionElement
  | DTMLEveryoneMentionElement
  | DTMLHereMentionElement
  | DFMDAnchorElement
  | DFMDNestedElement
  | DFMDElement;
