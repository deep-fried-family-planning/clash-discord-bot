import type * as E from 'effect/Effect';

export type AnyFn = (...args: any) => any;

export type Fx<E, R> = | (() => void)
                       | (() => Promise<void>)
                       | (() => E.Effect<void, E, R>)
                       | E.Effect<void, E, R>;

export type Reducer<A, B> = (prev: A, action: B) => A;

export type SetState<A> = | ((next: A) => void)
                          | ((update: (prev: A) => A) => void);

export type UseState<A> = (initial: A) => readonly [state: A, setState: SetState<A>];

export type UseReducer<A, B> = (initial: A, reducer: Reducer<A, B>) => readonly [state: A, dispatch: (action: B) => void];

export type UseEffect<E, R> = (fx: Fx<E, R>) => void;

export type RefObject<A> = {
  current: A | null;
};

export type UseRef<A> = (initial: A) => RefObject<A>;

export type UseMemo<A> = (lazy: () => A, deps?: any[]) => A;

export type UseCallback<A extends AnyFn> = (lazy: () => A, deps?: any[]) => A;

export type UseContext<A> = A;

export type Use = {
  State<A>(initial: A): readonly [state: A, setState: ((next: A) => void) | ((update: (prev: A) => A) => void)];
  Reducer<A, B>(initial: A, reducer: (prev: A, action: B) => A): readonly [state: A, dispatch: (action: B) => void];
  Effect<E, R>(fx: Fx<E, R>): void;
  Ref<A>(initial: A): RefObject<A>;
  Memo<A>(lazy: () => A, deps?: any[]): A;
  Callback<A extends AnyFn>(lazy: () => A, deps?: any[]): A;
  Context<A>(context: A): A;
};
