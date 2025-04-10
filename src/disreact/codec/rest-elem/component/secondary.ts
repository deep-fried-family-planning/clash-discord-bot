import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {Emoji} from '#src/disreact/codec/rest-elem/markdown/emoji.ts';
import {declareHandlerElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {DAPI} from '../../dapi/dapi';

export * as Secondary from '#src/disreact/codec/rest-elem/component/secondary.ts';
export type Secondary = never;

export const TAG  = 'secondary',
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
    custom_id     : S.optional(S.String),
    label         : S.optional(S.String),
    emoji         : S.optional(Emoji.Attributes),
    disabled      : S.optional(S.Boolean),
    [Keys.onclick]: Handler,
  }),
);

export const Element = declareHandlerElem(
  TAG,
  Attributes,
  Handler,
);

export const encode = (self: Elem, acc: any) => {
  return {
    label    : self.props.label ?? acc[Keys.primitive]?.[0],
    style    : DAPI.Component.SECONDARY,
    type     : DAPI.Component.BUTTON,
    custom_id: self.props.custom_id ?? self.ids,
    emoji    : self.props.emoji ?? acc[Keys.emoji]?.[0],
    disabled : self.props.disabled,
  };
};
