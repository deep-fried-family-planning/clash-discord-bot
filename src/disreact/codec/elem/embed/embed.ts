import {Author} from '#src/disreact/codec/elem/embed/author.ts';
import {Field} from '#src/disreact/codec/elem/embed/field.ts';
import {Footer} from '#src/disreact/codec/elem/embed/footer.ts';
import {Img} from '#src/disreact/codec/elem/embed/img.ts';
import {Keys} from '#src/disreact/codec/elem/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as Embed from '#src/disreact/codec/elem/embed/embed.ts';
export type Embed = never;

export const TAG  = 'embed',
             NORM = Keys.embeds;

export const Children = S.Union(
  S.String,
  Author.Element,
  Footer.Element,
  Img.Element,
  Field.Element,
);

export const Attributes = declareProps(
  S.Struct({
    title      : S.optional(S.String),
    description: S.optional(S.String),
    color      : S.optional(S.Int),
    url        : S.optional(S.String),
    fields     : S.optional(S.Array(Field.Attributes)),
    author     : S.optional(Author.Attributes),
    footer     : S.optional(Footer.Attributes),
    image      : S.optional(Img.Attributes),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    title      : self.props.title,
    description: self.props.description ?? acc[Keys.primitive]?.join(''),
    color      : self.props.color,
    url        : self.props.url,
    fields     : self.props.fields ?? acc[Keys.fields],
    author     : self.props.author ?? acc.author,
    footer     : self.props.footer ?? acc.footer,
    image      : self.props.image ?? acc[Keys.image],
  };
};
