import {type E, S} from '#src/internal/pure/effect.ts';

export const Id = Symbol.for('disreact/fc');

export const SourceSymbol = Symbol.for('disreact/fc/source');
export const NamingSymbol = Symbol.for('disreact/fc/naming');
export const RenderSymbol = Symbol.for('disreact/fc/render');

export * as FC from '#src/disreact/model/entity/fc.ts';
export type FC<P = any, A = any> =
  | Base
  | Sync<P, A>
  | Prom<P, A>
  | FnFx<P, A>
  | Src<P, A>;

interface Base<P = any, A = any> {
  (props?: P): A | A[] | Promise<A | A[]> | E.Effect<A | A[], any, any>;
  _tag?          : Render;
  displayName?   : string;
  sourceName?    : string;
  [NamingSymbol]?: string;
  [RenderSymbol]?: string;
  [SourceSymbol]?: string;
}

interface Known<P, A> extends Base<P, A> {
  [NamingSymbol]: string;
  [RenderSymbol]: Render;
}

interface Sync<P, A> extends Known<P, A> {
  (props?: P): A | A[];
  _tag          : Render.SYNC;
  [RenderSymbol]: Render.SYNC;
}

interface Prom<P, A> extends Known<P, A> {
  (props?: P): Promise<A | A[]>;
  _tag          : Render.ASYNC;
  [RenderSymbol]: Render.ASYNC;
}

interface FnFx<P, A> extends Known<P, A> {
  (props?: P): E.Effect<A | A[], any, any>;
  _tag          : Render.EFFECT;
  [RenderSymbol]: Render.EFFECT;
}

interface Src<P, A> extends Known<P, A> {
  [SourceSymbol]: string;
}

enum Render {
  SYNC   = 'Sync',
  ASYNC  = 'Async',
  EFFECT = 'Effect',
}

export const SYNC    = 'Sync' as const;
export const ASYNC   = 'Async' as const;
export const EFFECT  = 'Effect' as const;
const ANONYMOUS      = 'Anonymous' as const;
const ASYNC_FUNCTION = 'AsyncFunction' as const;


export const isFC     = <P, E>(fc: any): fc is FC<P, E> => typeof fc === 'function';
export const isSync   = <P, E>(fc: FC<P, E>): fc is Sync<P, E> => fc[RenderSymbol] === Render.SYNC;
export const isAsync  = <P, E>(fc: FC<P, E>): fc is Prom<P, E> => fc[RenderSymbol] === Render.ASYNC;
export const isEffect = <P, E>(fc: FC<P, E>): fc is FnFx<P, E> => fc[RenderSymbol] === Render.EFFECT;
export const isKnown  = <P, E>(fc: FC<P, E>): fc is Known<P, E> => !!fc[NamingSymbol] || !!fc[RenderSymbol];

export const getName  = (fc: FC) => fc[NamingSymbol]!;
export const getSrcId = (fc: FC) => (fc as any)[SourceSymbol]! as string;

export const init = (fc: FC): FC => {
  if (isKnown(fc)) {
    return fc;
  }

  if (fc.constructor.name === ASYNC_FUNCTION) {
    fc[RenderSymbol] = Render.ASYNC;

    if (fc._tag && fc._tag !== Render.ASYNC) {
      throw new Error(`Invalid Render: ${fc._tag}`);
    }
  }
  else if (fc._tag) {
    if (
      fc._tag === Render.SYNC ||
      fc._tag === Render.ASYNC ||

      fc._tag === Render.EFFECT
    ) {
      fc[RenderSymbol] = fc._tag as Render;
    }
    throw new Error(`Invalid Render: ${fc._tag}`);
  }

  if (fc.sourceName) {
    fc[NamingSymbol] = fc.sourceName;
  }
  else if (fc.displayName) {
    fc[NamingSymbol] = fc.displayName;
  }
  else if (fc.name) {
    fc[NamingSymbol] = fc.name;
  }
  else {
    fc[NamingSymbol] = ANONYMOUS;
  }

  return fc;
};

export const initSource = (self: FC): FC => {
  const fc = init(self);

  if (fc[NamingSymbol] === ANONYMOUS) {
    throw new Error(`Source cannot be named ${ANONYMOUS}`);
  }
    // if (fc[SourceId]) {
    //   throw new Error(`Source ${fc[SourceId]} (${fc[Naming]}) already initialized`);
  // }
  else {
    fc[SourceSymbol] = fc.sourceName
      ? fc.sourceName
      : self[NamingSymbol]!;
  }

  return fc;
};
