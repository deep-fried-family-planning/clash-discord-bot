export const declarePrototype = <A>(prototype: Partial<A>) =>
  Object.create(prototype) as A;

export const declareSubtype = <
  A extends B,
  B,
>(
  prototype: B,
  subtype: Partial<A>,
) =>
  Object.assign(
    Object.create(prototype as any),
    subtype,
  ) as A;

export const createInstance = <A>(prototype: A) =>
  Object.create(prototype as any) as A;
