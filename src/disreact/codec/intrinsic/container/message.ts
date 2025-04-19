import {Mentions} from '#src/disreact/codec/intrinsic/component/mentions.ts';
import {Roles} from '#src/disreact/codec/intrinsic/component/roles.ts';
import {Select} from '#src/disreact/codec/intrinsic/component/select.ts';
import {Users} from '#src/disreact/codec/intrinsic/component/users.ts';
import {Actions} from '#src/disreact/codec/intrinsic/container/actions.ts';
import {Util} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/internal/pure/effect';
import { Keys } from '../keys';

export * as Message from '#src/disreact/codec/intrinsic/container/message.ts';
export type Message = never;

export const TAG  = 'message',
             NORM = TAG;

export const Children = S.Union(
  Actions.Element,
  Select.Element,
  Roles.Element,
  Users.Element,
  Mentions.Element,
);

export const Attributes = Util.declareProps(
  S.Struct({
    display: S.optional(S.Literal('public', 'ephemeral')),
    content: S.optional(S.String),
    flags  : S.optional(S.Number),
  }),
);

export const Element = Util.declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    content   : self.props.content ?? acc[Keys.primitive]?.[0] ?? undefined,
    embeds    : acc[Keys.embeds],
    components: acc[Keys.components],
    flags     : self.props.flags ?? self.props.display === 'ephemeral' ? 64 : undefined,
  };
};
