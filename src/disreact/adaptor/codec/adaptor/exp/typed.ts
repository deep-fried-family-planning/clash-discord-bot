export const TypeId = Symbol.for('disreact/typed');

export interface Typed<A = any> {
  [TypeId]: A;
}

export const isTyped = (u: unknown): u is Typed =>
  typeof u === 'object'
  && u !== null
  && TypeId in u;
