import {dual} from 'effect/Function';

export type Flagged<A> = {
  list: Set<A>;
};

export const empty = <A>(): Flagged<A> => ({
  list: new Set(),
});

export const add__ = <A>(self: Flagged<A>, a: A) => {
  self.list.add(a);
  return self;
};

export const add = dual<
  <A>(a: A) => (self: Flagged<A>) => Flagged<A>,
  typeof add__
>(2, add__);

export const remove__ = <A>(self: Flagged<A>, a: A) => {
  self.list.delete(a);
  return self;
};

export const remove = dual<
  <A>(a: A) => (self: Flagged<A>) => Flagged<A>,
  typeof remove__
>(2, remove__);

export const merge__ = <A>(self: Flagged<A>, other: Flagged<A>) => {
  self.list = self.list.union(other.list);
  return self;
};

export const merge = dual<
  <A>(other: Flagged<A>) => (self: Flagged<A>) => Flagged<A>,
  typeof merge__
>(2, merge__);

export const toArray = <A>(self: Flagged<A>) => [...self.list];
