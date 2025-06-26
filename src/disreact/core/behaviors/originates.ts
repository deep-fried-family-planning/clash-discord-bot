export const symbol = Symbol.for('disreact/originates');

export interface OriginatesFrom<A> {
  [symbol](): A;
}

export const isOriginatesFrom = <A>(u: unknown): u is OriginatesFrom<A> => typeof u === 'object' && u !== null && symbol in u;

export const originates = <A>(self: A): A => {
  if (!isOriginates(self)) {
    throw new Error('Not Originates');
  }
  return self[symbol]();
};
