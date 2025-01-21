/* eslint-disable @typescript-eslint/no-empty-object-type */
export type One<T> = {children: T};
export type Many<T> = {children?: T[]};
export type Both<T> = {children?: T | T[]};

export type Attr<Props, Children> = Props & {children?: Children | Children[]};
export type AttrOrChild<Props, Children> = Props | {children: Children | Children[]};
export type Elem<ObjectUnion> = ObjectUnion[keyof ObjectUnion];
export type NoAt = {};

export type AtLeast1<Element> = Element | Element[];
