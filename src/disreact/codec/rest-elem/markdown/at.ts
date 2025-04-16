import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as AtMention from '#src/disreact/codec/rest-elem/markdown/at.ts';
export type AtMention = never;

export const TAG  = 'at',
             NORM = Keys.primitive;

export const Children = S.Never;

export const Attributes = S.Union(
  declareProps(S.Struct({here: S.Boolean})),
  declareProps(S.Struct({everyone: S.Boolean})),
  declareProps(S.Struct({user: S.Union(S.String, S.Int)})),
  declareProps(S.Struct({role: S.Union(S.String, S.Int)})),
  declareProps(S.Struct({channel: S.Union(S.String, S.Int)})),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  if (self.props.here) return '@here';
  if (self.props.everyone) return '@everyone';
  if (self.props.user) return `@${self.props.user}`;
  if (self.props.role) return `@&${self.props.role}`;
  if (self.props.channel) return `#${self.props.channel}`;
  return '';
};
