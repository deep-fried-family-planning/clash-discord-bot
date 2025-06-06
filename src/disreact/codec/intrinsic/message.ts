import * as S from 'effect/Schema';
import * as Norm from '#src/disreact/codec/intrinsic/norm.ts';
import * as Rest from '#src/disreact/codec/intrinsic/rest-element.ts';
import * as Embed from '#src/disreact/codec/intrinsic/embed.ts';

export const MESSAGE = 'message';
export const MessageAttributes = Rest.Attributes({
  display: S.optional(S.Literal('public', 'ephemeral')),
  content: S.optional(S.String),
  flags  : S.optional(S.Number),
});
export const encodeMessage = (self: any, arg: any) => {
  return {
    content   : self.props.content ?? arg[Norm.PRIMITIVE]?.[0] ?? undefined,
    embeds    : arg[Embed.EMBED],
    components: arg[Norm.COMPONENTS],
    flags     : self.props.flags ?? self.props.display === 'ephemeral' ? 64 : undefined,
  };
};

export const EPHEMERAL = 'ephemeral';
export const EphemeralAttributes = Rest.Attributes({
  content: S.optional(S.String),
  flags  : S.optional(S.Number),
});
export const encodeEphemeral = (self: any, arg: any) => {
  return {
    content   : self.props.content ?? arg[Norm.PRIMITIVE]?.[0] ?? undefined,
    embeds    : arg[Embed.EMBED],
    components: arg[Norm.COMPONENTS],
    flags     : 64,
  };
};

export type MessageAttributes = typeof MessageAttributes.Type;
export type EphemeralAttributes = typeof EphemeralAttributes.Type;
