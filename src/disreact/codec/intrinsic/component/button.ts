import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {Emoji} from '#src/disreact/codec/intrinsic/markdown/emoji.ts';
import {declareHandlerElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import {Declare} from '#src/disreact/model/declare.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {DAPI} from '../../dapi/dapi';

export * as Button from '#src/disreact/codec/intrinsic/component/button.ts';
export type Button = never;

export const TAG  = 'button',
             NORM = Keys.buttons;

export const EventData = S.Struct({
  data: DAPI.Component.ButtonData,
});

export const Handler = Declare.handler(EventData);

export const Children = S.Union(
  S.Undefined,
);

export const Attributes = declareProps(
  S.Struct({
    custom_id     : S.optional(S.String),
    style         : S.optional(S.Literal(1, 2, 3, 4, 5, 6)),
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

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    label    : self.props.label ?? acc[Keys.primitive]?.[0],
    style    : self.props.style ?? 1,
    type     : DAPI.Component.BUTTON,
    custom_id: self.props.custom_id ?? self.ids,
    emoji    : self.props.emoji ?? acc[Keys.emoji]?.[0],
    disabled : self.props.disabled,
  };
};
