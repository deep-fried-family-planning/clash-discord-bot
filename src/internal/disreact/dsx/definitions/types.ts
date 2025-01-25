import type {DisReact} from '#disreact/dsx/jsx-runtime.ts';
import type {ne, str} from '#src/internal/pure/types-pure.ts';






export type IntrinsicProps<Props, Children = never> = Children extends never
  ? Props
  : Children extends unknown[]
    ? Props & {children: Children}
    : Children extends unknown;


export type IntrinsicShape = {
  type: ne;
  props: ne;
  children: ne[];
};


export type Intrinsic<T = ne, P = ne, C = ne> = {
  type: T;
  props: P;
  children: C;
};

export const creatorIntrinsic = <T, P, C>(type: T, props: P, children: C): Intrinsic<T, P, C> => {
  return {
    type,
    props,
    children,
  };
};


export type TypeFromTag<Tag> = Tag extends str ? Tag : never;


export type CreatedElement<T, P, C> = {
  tag: T;
  props: P;
  children: C;
};


export type MetaElement<T, P, C> = {
  _tag: T extends str ? T : 'function';
  tag: T;
  meta: DisReact.MetaAttribute;
  props: P;
  children: C;
};


export type CreateElement<T, P, C> = (tag: T, props: P, children: C) => CreatedElement<T, P, C>;

export type EncodeElement<T, P, C, O> = (element: MetaElement<T, P, C>) => O;

export type DecodeElement<T, P, C, I> = (rest: I) => MetaElement<T, P, C>;


export const typeInfo = <
  Tag,
  Type,
  Props,
  Children,
  Element,
  Meta,
  In,
  Out,
>() => class {
  public static Tag: Tag;
  public static TagType: Type;
  public static Props: Props;
  public static Children: Children;
  public static Element: Element;
  public static Meta: Meta;
  public static HTMLAttributes: Children extends never ? Props : Props & {children: Children};
  public static Out: Out;
  public static In: In;
};
