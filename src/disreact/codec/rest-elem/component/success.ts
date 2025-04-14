import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {Emoji} from '#src/disreact/codec/rest-elem/markdown/emoji.ts';
import {declareHandlerElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {DAPI} from '../../dapi/dapi';

export * as Success from '#src/disreact/codec/rest-elem/component/success.ts';
export type Success = never;

export const TAG  = 'success',
             NORM = Keys.buttons;

export const EventData = S.Struct({
  data: DAPI.Component.ButtonData,
});

export const Handler = Trigger.declareHandler(EventData);

export const Children = S.Union(
  S.String,
  Emoji.Element,
);

export const Attributes = declareProps(
  S.Struct({
    custom_id      : S.optional(S.String),
    label          : S.optional(S.String),
    emoji          : S.optional(Emoji.Attributes),
    disabled       : S.optional(S.Boolean),
    [Keys.onclick] : Handler,
    [Keys.children]: S.optional(S.Any),
  }),
);

export const Element = declareHandlerElem(
  TAG,
  Attributes,
  Handler,
);

export const encode = (self: Elem, acc: any) => {
  return {
    type     : DAPI.Component.BUTTON,
    custom_id: self.props.custom_id ?? self.ids,
    style    : DAPI.Component.SUCCESS,
    label    : self.props.label ?? acc[Keys.primitive]?.[0],
    emoji    : self.props.emoji ?? acc[Keys.emoji]?.[0],
    disabled : self.props.disabled,
  };
};
