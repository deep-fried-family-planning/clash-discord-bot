export type Notify<A> = {
  list: Set<A>;
};

export const empty = <A>(): Notify<A> => ({
  list: new Set(),
});

export const add = <A>(self: Notify<A>, a: A) => {
  self.list.add(a);
  return self;
};

export const remove = <A>(self: Notify<A>, a: A) => {
  self.list.delete(a);
  return self;
};

export const merge = <A>(self: Notify<A>, other: Notify<A>) => {
  self.list = self.list.union(other.list);
  return self;
};

export const toArray = <A>(self: Notify<A>) => [...self.list];
