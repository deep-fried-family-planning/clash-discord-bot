import * as S from 'effect/Schema';
import * as Norm from '#disreact/adaptor/intrinsic/norm.ts';
import * as Rest from '#disreact/adaptor/codec/rest-element.ts';

export const AUTHOR = 'author';
export const AuthorAttributes = Rest.Attributes({
  name: S.String,
  url : S.optional(S.String),
});
export const encodeAuthor = (self: any, args: any) => {
  return {
    name: self.props.name ?? args[Norm.PRIMITIVE]?.join(''),
    url : self.props.url,
  };
};

export const IMAGE = 'img';
export const ImageAttributes = Rest.Attributes({
  url: S.String,
});
export const encodeImage = (self: any, args: any) => {
  return {
    url: self.props.url,
  };
};

export const FOOTER = 'footer';
export const FooterAttributes = Rest.Attributes({
  text: S.String,
});
export const encodeFooter = (self: any, args: any) => {
  return {
    text: self.props.text ?? args[Norm.PRIMITIVE]?.join(''),
  };
};

export const FIELD = 'field';
export const FieldAttributes = Rest.Attributes({
  name  : S.String,
  value : S.optional(S.String),
  inline: S.optional(S.Boolean),
});
export const encodeField = (self: any, args: any) => {
  return {
    name  : self.props.name,
    value : self.props.value ?? args[Norm.PRIMITIVE]?.join(''),
    inline: self.props.inline,
  };
};

export const EMBED = 'embed';
export const EmbedAttributes = Rest.Attributes({
  author     : S.optional(AuthorAttributes),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Int),
  url        : S.optional(S.String),
  image      : S.optional(ImageAttributes),
  fields     : S.optional(S.Array(FieldAttributes)),
  footer     : S.optional(FooterAttributes),
});
export const encodeEmbed = (self: any, args: any) => {
  return {
    author     : self.props.author ?? args.author,
    title      : self.props.title,
    description: self.props.description ?? args[Norm.PRIMITIVE]?.join(''),
    color      : self.props.color,
    url        : self.props.url,
    fields     : self.props.fields ?? args[FIELD],
    image      : self.props.image ?? args[IMAGE],
    footer     : self.props.footer ?? args.footer,
  };
};

export type AuthorAttributes = typeof AuthorAttributes.Type;
export type ImageAttributes = typeof ImageAttributes.Type;
export type FooterAttributes = typeof FooterAttributes.Type;
export type FieldAttributes = typeof FieldAttributes.Type;
export type EmbedAttributes = typeof EmbedAttributes.Type;
