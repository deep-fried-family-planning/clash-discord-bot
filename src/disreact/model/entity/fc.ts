import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import * as Arr from 'effect/Array';



export * as FC from './fc.ts';
export type FC<P = any, E = any> =
  | Any<P, E>
  | SFC<P, E>
  | AFC<P, E>
  | EFC<P, E>;

interface Base {
  (props?: any): any;
  _tag?       : string;
  displayName?: string;
  sourceName? : string;
}

export interface Any<P, E> extends Base {
  // (props: P): E | E[];
  [Naming]?  : string;
  [Render]?  : string;
  [SourceId]?: string;
}

export interface SFC<P, E> extends Any<P, E> {
  (props: P): E | E[];
  [Render]: typeof SYNC;
  [Naming]: string;
}

export interface AFC<P, E> extends Any<P, E> {
  (props: P): Promise<E | E[]>;
  [Render]: typeof ASYNC;
  [Naming]: string;
}

export interface EFC<P, E> extends Any<P, E> {
  (props: P): E.Effect<E | E[], any, any>;
  [Render]: typeof EFFECT;
  [Naming]: string;
}

export interface Known<P, E> extends Any<P, E> {
  [Naming]: string;
  [Render]: Render;
}

export interface Src<P, E> extends Known<P, E> {
  [SourceId]: string;
}

type Render = typeof SYNC | typeof ASYNC | typeof EFFECT;

export const SourceId = Symbol.for('disreact/fc/source');
export const Naming   = Symbol.for('disreact/fc/naming');
export const Render   = Symbol.for('disreact/fc/render');

export const SYNC   = 'Sync';
export const ASYNC  = 'Async';
export const EFFECT = 'Effect';

export const isFC = <P, E>(fc: any): fc is Any<P, E> => typeof fc === 'function';

export const isSync   = <P, E>(fc: Any<P, E>): fc is SFC<P, E> => fc[Render] === SYNC;
export const isAsync  = <P, E>(fc: Any<P, E>): fc is AFC<P, E> => fc[Render] === ASYNC;
export const isEffect = <P, E>(fc: Any<P, E>): fc is EFC<P, E> => fc[Render] === EFFECT;
export const isSource = <P, E>(fc: Any<P, E>): fc is Src<P, E> => !!fc[SourceId];

export const getNaming = (self: FC) => self[Naming]!;
export const getSource = (self: FC) => self[SourceId]!;

const ANONYMOUS      = 'Anonymous' as const;
const ASYNC_FUNCTION = 'AsyncFunction' as const;

export const init = (fc: FC): FC => {
  if (fc[Naming] || fc[Render]) {
    return fc;
  }

  fc[Naming]
    = fc.displayName ? fc.displayName
    : fc.name ? fc.name
      : ANONYMOUS;

  if (fc.constructor.name === ASYNC_FUNCTION) {
    if (fc._tag && fc._tag !== ASYNC) {
      throw new Error(`Invalid Render: ${fc._tag}`);
    }

    fc[Render] = ASYNC;
  }

  if (fc._tag) {
    if (![SYNC, ASYNC, EFFECT].includes(fc._tag)) {
      throw new Error(`Invalid Render: ${fc._tag}`);
    }

    fc[Render] = fc._tag as Render;
  }

  return fc;
};

export const initRoot = (self: FC): FC => {
  const fc = init(self);

  if (fc[Naming] === ANONYMOUS) {
    throw new Error(`Source cannot be named ${ANONYMOUS}`);
  }
  // if (fc[SourceId]) {
  //   throw new Error(`Source ${fc[SourceId]} (${fc[Naming]}) already initialized`);
  // }
  else {
    fc[SourceId] = fc.sourceName ? fc.sourceName : self[Naming]!;
  }

  return fc;
};

export const setSync = (self: FC) => {
  self[Render] = SYNC;
  return self;
};

export const renderSync = (self: FC, props: any) =>
  E.sync(
    () => Arr.ensure(self(props)),
  );

export const setAsync = (self: FC) => {
  self[Render] = ASYNC;
  return self;
};

export const renderAsync = (self: FC, props: any) =>
  E.tryPromise(
    async () => Arr.ensure(await self(props)),
  );

export const setEffect = (self: FC) => {
  self[Render] = EFFECT;
  return self;
};

export const renderEffect = (self: FC, props: any) =>
  pipe(
    self(props) as E.Effect<any>,
    E.map(
      (children) => Arr.ensure(children),
    ),
  );
