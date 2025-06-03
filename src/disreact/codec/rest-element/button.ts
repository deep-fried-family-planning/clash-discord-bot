import * as Misc from '#src/disreact/codec/rest-element/misc.ts';
import * as Norm from '#src/disreact/codec/rest-element/norm.ts';
import * as Rest from '#src/disreact/codec/rest-element/rest-element.ts';
import {Discord} from 'dfx';
import * as S from 'effect/Schema';

export const PRIMARY = 'primary';
export const PrimaryAttributes = Rest.Attributes({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(Misc.EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const encodePrimary = (self: any, arg: any) => {
  return {
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : Discord.ButtonStyleTypes.PRIMARY as number,
    custom_id: self.props.custom_id ?? self.ids,
    label    : self.props.label ?? arg[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? arg[Misc.EMOJI]?.[0],
    disabled : self.props.disabled,
  };
};

export const SECONDARY = 'secondary';
export const SecondaryAttributes = Rest.Attributes({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(Misc.EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const encodeSecondary = (self: any, arg: any) => {
  const encoded = encodePrimary(self, arg);
  encoded.style = Discord.ButtonStyleTypes.SECONDARY;
  return encoded;
};

export const SUCCESS = 'success';
export const SuccessAttributes = Rest.Attributes({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(Misc.EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const encodeSuccess = (self: any, arg: any) => {
  const encoded = encodePrimary(self, arg);
  encoded.style = Discord.ButtonStyleTypes.SUCCESS;
  return encoded;
};

export const DANGER = 'danger';
export const DangerAttributes = Rest.Attributes({
  custom_id: S.optional(S.String),
  label    : S.optional(S.String),
  emoji    : S.optional(Misc.EmojiAttributes),
  disabled : S.optional(S.Boolean),
  onclick  : Rest.Handler(S.Any),
});
export const encodeDanger = (self: any, arg: any) => {
  const encoded = encodePrimary(self, arg);
  encoded.style = Discord.ButtonStyleTypes.DANGER;
  return encoded;
};

export const LINK = 'link';
export const LinkAttributes = S.Struct({
  url     : S.String,
  label   : S.optional(S.String),
  emoji   : S.optional(Misc.EmojiAttributes),
  disabled: S.optional(S.Boolean),
});
export const encodeLink = (self: any, arg: any) => {
  return {
    type    : Discord.MessageComponentTypes.BUTTON,
    style   : Discord.ButtonStyleTypes.LINK,
    url     : self.props.url,
    label   : self.props.label ?? arg[Norm.PRIMITIVE]?.[0],
    emoji   : self.props.emoji ?? arg[Misc.EMOJI]?.[0],
    disabled: self.props.disabled,
  };
};

export const PREMIUM = 'premium';
export const PremiumAttributes = S.Struct({
  sku_id  : S.String,
  disabled: S.optional(S.Boolean),
});
export const encodePremium = (self: any, arg: any) => {
  return {
    type    : Discord.MessageComponentTypes.BUTTON,
    style   : Discord.ButtonStyleTypes.PREMIUM,
    sku_id  : self.props.sku_id,
    disabled: self.props.disabled,
  };
};

export const BUTTON = 'button';
export const ButtonAttributes = Rest.Attributes({
  custom_id: S.optional(S.String),
  style    : S.optional(S.Literal(1, 2, 3, 4, 5, 6)),
  label    : S.optional(S.String),
  emoji    : S.optional(Misc.EmojiAttributes),
  disabled : S.optional(S.Boolean),
  url      : S.optional(S.String),
  onclick  : S.optional(Rest.Handler(S.Any)),
});
export const encodeButton = (self: any, arg: any) => {
  return {
    type     : Discord.MessageComponentTypes.BUTTON,
    style    : self.props.style ?? Discord.ButtonStyleTypes.PRIMARY,
    custom_id: self.props.custom_id ?? self.ids,
    label    : self.props.label ?? arg[Norm.PRIMITIVE]?.[0],
    emoji    : self.props.emoji ?? arg[Misc.EMOJI]?.[0],
    disabled : self.props.disabled,
  };
};

export const ACTIONS = 'actions';
export const ActionsAttributes = Rest.Attributes({});
export const encodeActions = (self: any, arg: any) => {
  return {
    type      : 1,
    components: arg[Norm.BUTTONS],
  };
};

export type PrimaryAttributes = typeof PrimaryAttributes.Type;
export type SecondaryAttributes = typeof SecondaryAttributes.Type;
export type SuccessAttributes = typeof SuccessAttributes.Type;
export type DangerAttributes = typeof DangerAttributes.Type;
export type LinkAttributes = typeof LinkAttributes.Type;
export type PremiumAttributes = typeof PremiumAttributes.Type;
export type ButtonAttributes = typeof ButtonAttributes.Type;
export type ActionsAttributes = typeof ActionsAttributes.Type;
