import type {str, unk} from '#src/internal/pure/types-pure.ts';



export type CodecElement<Props, Children> = {
  props   : Props;
  children: Children;
};

type TagType<Tag> = Tag extends str ? Tag : Tag extends undefined ? undefined : (props: any) => any;

type CreatedType<Tag, Props, Children, Created> = Created extends unknown[]
  ? Created
  : Children extends unknown[]
    ? {
      type    : TagType<Tag>;
      props   : Props;
      children: Children;
    }
    : Children extends [unknown]
      ? {
        type    : TagType<Tag>;
        props   : Props;
        children: Children;
      }
      : {
        type : TagType<Tag>;
        props: Props;
      };

export const FnTag = () => {};

export const defineCodec = <Tag, Props, Children, Created, RestOut, RestIn>(
  tag: Tag,
  creator: (type: TagType<Tag>, props: Props, children: Children) => CreatedType<Tag, Props, Children, Created>,
  encoder: (self: Created) => RestOut,
  decoder: (rest: RestIn) => CreatedType<Tag, Props, Children, Created>,
) => {
  const typeOf = typeof tag;
  const T      = {
    Tag           : null as Tag,
    TagType       : null as unknown as TagType<Tag>,
    Props         : null as Props,
    Children      : null as Children,
    Created       : null as Created,
    RestOut       : null as RestOut,
    RestIn        : null as RestIn,
    HTMLAttributes: null as unknown as Children extends unk[] ? Props & {children: Children} : Props,
  };

  return {
    tag,
    typeOf,
    creator,
    encoder,
    decoder,
    T,
    ...T,
  };
};
