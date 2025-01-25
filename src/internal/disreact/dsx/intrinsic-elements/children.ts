/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type {bool, ne, unk} from '#src/internal/pure/types-pure.ts';



export type None = undefined;
export type One<A> = A;
export type Many<A> = A[];


export type Any<A> = None | One<A> | Many<A>;
export type Defined<A> = One<A> | Many<A>;


const tagnone = 'none';
const tagone = 'one';
const tagmany = 'many';


export const none = () => ({_tag: tagnone} as const);
export const one = <A>(val: A) => ({_tag: tagone, one: val} as const);
export const many = <A>(vals: A[]) => ({_tag: tagmany, many: vals} as const);


export type Tagged<A = ne> =
  | {_tag: typeof tagnone}
  | {_tag: typeof tagone; one: One<A>}
  | {_tag: typeof tagmany; many: Many<A>};


// @ts-expect-error guard helper
export const isnone = <A>(v: unk): v is A => v._tag === tagnone;
// @ts-expect-error guard helper
export const isone = <A>(v: unk): v is A => v._tag === tagone;
// @ts-expect-error guard helper
export const ismany = <A>(v: unk): v is A => v._tag === tagmany;


export const match = <A, B>(
  matchers: {
    none: () => B;
    one : (one: A) => B;
    many: (many: A[]) => B;
  },
) => (
  matchee?: Tagged<A>,
) => {
  if (!matchee) return matchers.none();
  if (matchee._tag === tagnone) return matchers.none();
  if (matchee._tag === tagone) return matchers.one(matchee.one);
  if (matchee._tag !== tagmany) throw new Error('Unknown children tag');
  return matchers.many(matchee.many);
};


export type T<A> =
  | undefined
  | null
  | bool
  | A
  | A[];


export const asNodes = <A>(children?: T<A>) => {
  if (children === undefined || children === null) return [];
  if (children === true || children === false) return [];
  if (Array.isArray(children)) return children;
  return [children];
};
