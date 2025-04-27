import {DAPIComponent} from '#src/disreact/codec/dapi/dapi-component';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/disreact/utils/re-exports.ts';

export * as Premium from '#src/disreact/codec/intrinsic/component/premium.ts';
export type Premium = never;

export const TAG  = 'premium',
             NORM = Keys.buttons;

export const Children = S.Union(
  S.Undefined,
);

export const Attributes = declareProps(
  S.Struct({
    sku_id: S.String,
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    type    : DAPIComponent.BUTTON,
    sku_id  : self.props.sku_id,
    style   : DAPIComponent.PREMIUM,
    disabled: self.props.disabled,
  };
};
