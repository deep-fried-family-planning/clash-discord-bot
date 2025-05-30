import {Button} from '#src/disreact/codec/intrinsic/button/button.ts';
import {Danger} from '#src/disreact/codec/intrinsic/button/danger.ts';
import {Link} from '#src/disreact/codec/intrinsic/button/link.ts';
import {Premium} from '#src/disreact/codec/intrinsic/button/premium.ts';
import {Primary} from '#src/disreact/codec/intrinsic/button/primary.ts';
import {Secondary} from '#src/disreact/codec/intrinsic/button/secondary.ts';
import {Success} from '#src/disreact/codec/intrinsic/button/success.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';

import * as S from 'effect/Schema';
import {Util} from 'src/disreact/codec/intrinsic/util.ts';

export * as Actions from '#src/disreact/codec/intrinsic/button/actions.ts';
export type Actions = never;

export const TAG  = 'actions',
             NORM = Keys.components;

export const Children = S.Union(
  Button.Element,
  Primary.Element,
  Secondary.Element,
  Success.Element,
  Danger.Element,
  Link.Element,
  Premium.Element,
);

export const Attributes = Util.declareProps(
  S.Struct({}),
);

export const Element = Util.declareElem(
  TAG,
  Attributes,
);

export const encode = (self: any, acc: any) => {
  return {
    type      : 1,
    components: acc[Keys.buttons],
  };
};
