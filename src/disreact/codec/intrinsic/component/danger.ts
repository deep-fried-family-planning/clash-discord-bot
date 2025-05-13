import {DAPIComponent} from '#src/disreact/codec/dapi/dapi-component';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {Emoji} from '#src/disreact/codec/intrinsic/markdown/emoji.ts';
import {declareHandlerElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import {Declare} from '#src/disreact/model/declare.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as S from 'effect/Schema';
import {DAPI} from '../../dapi/dapi';

export * as Danger from '#src/disreact/codec/intrinsic/component/danger.ts';
export type Danger = never;

export const TAG  = 'danger',
             NORM = Keys.buttons;

export const EventData = S.Struct({
  data: DAPI.Component.ButtonData,
});

export const Handler = Declare.handler(EventData);

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

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    type     : DAPIComponent.BUTTON,
    custom_id: self.props.custom_id ?? self.ids,
    style    : DAPIComponent.DANGER,
    label    : self.props.label ?? acc[Keys.primitive]?.[0],
    emoji    : self.props.emoji ?? acc[Keys.emoji]?.[0],
    disabled : self.props.disabled,
  };
};
