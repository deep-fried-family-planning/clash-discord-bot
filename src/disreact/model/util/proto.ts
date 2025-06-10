export const array = () => Object.create(global.Array.prototype);

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

export const make = (proto: any) =>
  Object.create(proto);

export const from = <A>(proto: any, obj: Partial<A>): A =>
  // setPrototype(proto, obj);
  assignProto(proto, obj);

export const pure = <A>(proto: any, obj: Partial<A>): A =>
  isDEV
    ? Object.freeze(from(proto, obj))
    : from(proto, obj);
