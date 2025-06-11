export type Proto = any;

export const newArray = () => Object.create(global.Array.prototype);

export const isDEV = process.env.NODE_ENV === 'development';

const assignProto = (proto: any, obj: any) =>
  Object.assign(
    obj,
    proto,
  );

const setPrototype = (proto: any, obj: any) =>
  Object.setPrototypeOf(
    obj,
    proto,
  );

export const array = (proto: any) =>
  assignProto(
    Object.create(Array.prototype),
    proto,
  );

export const object = (proto: any) =>
  assignProto(
    Object.create(Object.prototype),
    proto,
  );

export const make = <A>(proto: Partial<A>): A =>
  Object.create(proto);

export const extend = <A>(proto: any, obj: Partial<A>): A =>
  assignProto(proto, obj);

export const create = <A>(proto: A, obj: Partial<A>): A =>
  // setPrototype(proto, obj);
  assignProto(proto, obj);

export const pure = <A>(proto: any, obj: Partial<A>): A =>
  isDEV
    ? Object.freeze(create(proto, obj))
    : create(proto, obj);
