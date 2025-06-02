import * as Rest from '#src/disreact/codec/rest-element/rest-element.ts';
import * as S from 'effect/Schema';

export const EMOJI = 'emoji';
export const EmojiAttributes = Rest.Attributes({
  name    : S.optional(S.String),
  id      : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export const encodeEmoji = (self: any, acc: any) => {
  return {
    name    : self.props.name,
    id      : self.props.id,
    animated: self.props.animated,
  };
};

export type EmojiAttributes = typeof EmojiAttributes.Type;
