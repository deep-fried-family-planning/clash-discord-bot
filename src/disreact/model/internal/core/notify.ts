import {dual} from 'effect/Function';

export type Notify<A> = {
  list: Set<A>;
};

export const empty = <A>(): Notify<A> => ({
  list: new Set(),
});

export const add__ = <A>(self: Notify<A>, a: A) => {
  self.list.add(a);
  return self;
};

export const add = dual<
  <A>(a: A) => (self: Notify<A>) => Notify<A>,
  typeof add__
>(2, add__);

export const remove__ = <A>(self: Notify<A>, a: A) => {
  self.list.delete(a);
  return self;
};

export const remove = dual<
  <A>(a: A) => (self: Notify<A>) => Notify<A>,
  typeof remove__
>(2, remove__);

export const merge__ = <A>(self: Notify<A>, other: Notify<A>) => {
  self.list = self.list.union(other.list);
  return self;
};

export const merge = dual<
  <A>(other: Notify<A>) => (self: Notify<A>) => Notify<A>,
  typeof merge__
>(2, merge__);

export const toArray = <A>(self: Notify<A>) => [...self.list];
