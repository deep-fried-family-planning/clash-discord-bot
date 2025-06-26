export type Traits = never;

const LineageId = Symbol.for('disreact/Lineage');

export interface Lineage<A> {
  [LineageId](): A | undefined;
}

export const isLineage = <A>(u: unknown): u is Lineage<A> => typeof u === 'object' && u !== null && LineageId in u;

export const lineage = <A, B extends Lineage<A>>(self: B): A | undefined => {
  if (!isLineage(self)) {
    return undefined;
  }
  return self[LineageId]();
};
