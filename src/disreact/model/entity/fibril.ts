import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import type {Root} from '#src/disreact/model/entity/root.ts';
import * as MsgPack from '@msgpack/msgpack';
import {pipe, Record} from 'effect';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as pako from 'pako';

export type Monomer =
  | Null
  | State
  | Dependency
  | Modal
  | Message;

export type Null = null;
export type State = {s: any};
export type Dependency = {d: any};
export type Modal = {m: any};
export type Message = {e: any};

export const Null = S.Null;
export const State = S.Struct({s: S.Any});
export const Dependency = S.Struct({d: S.Any});
export const Modal = S.Struct({m: S.Any});
export const Message = S.Struct({e: S.Any});
export const Any = S.Union(Null, State, Dependency, Modal, Message);

export const isNull = (self: Monomer): self is Null => self === null;
export const isState = (self: Monomer): self is State => !!self && 's' in self;
export const isDependency = (self: Monomer): self is Dependency => !!self && 'd' in self;
export const isModal = (self: Monomer): self is Modal => !!self && 'm' in self;
export const isMessage = (self: Monomer): self is Message => !!self && 'e' in self;

export type Polymer = {
  pc   : number;
  stack: Chain[];
};

export const Chain = S.mutable(S.Array(Any));
export type Chain = typeof Chain.Type;

export * as Fibril from '#src/disreact/model/entity/fibril.ts';
export type Fibril = never;

export type Hydrant = typeof Hydrant.Type;

export const Hydrant = S.transform(
  S.String,
  S.Struct({
    id     : S.String,
    props  : S.optional(S.Any),
    strands: S.Record({key: S.String, value: Chain}),
  }),
  {
    encode: (hydrant) => deflate(hydrant),
    decode: (hash) => inflate(hash),
  },
);

const deflate = (data: any) =>
  pipe(
    MsgPack.encode(data),
    pako.deflate,
    (binary) => Buffer.from(binary).toString('base64url'),
  );

const inflate = (encoded: string) =>
  pipe(
    Buffer.from(encoded, 'base64url'),
    pako.inflate,
    MsgPack.decode,
  ) as any;


export type Strand = {
  pc    : number;
  rc    : number;
  stack : Chain;
  saved : Chain;
  queue : any[];
  elem? : Elem.Task;
  nexus?: Nexus | undefined;
};

export const isSameStrand = (self: Strand) => {
  const a = self.stack;
  const b = self.saved;

  if (a.length !== b.length) {
    return false;
  }

  const stackData = Data.array(self.stack.map((s) => s === null ? null : Data.struct(s)));
  const priorData = Data.array(self.saved.map((s) => s === null ? null : Data.struct(s)));

  return Equal.equals(stackData, priorData);
};

export const makeStrand = (): Strand =>
  ({
    rc   : 0,
    pc   : 0,
    stack: [],
    saved: [],
    queue: [],
  });

export const cloneStrand = (self: Strand): Strand => {
  if (self.queue.length > 0) {
    throw new Error('Queue is not empty.');
  }

  const {elem, nexus, ...rest} = self;

  return structuredClone(rest);
};


export type Nexus = {
  id     : string;
  props  : Hydrant;
  strands: {[id: string]: Strand};
  next: {
    id   : string | null;
    props: any;
  };
  queue   : any[];
  request?: any;
  root?   : Root | undefined;
};

export const makeNexus = (props?: any): Nexus =>
  ({
    id     : '-',
    props  : props ?? {},
    strands: {},
    next   : {
      id   : '-',
      props: {},
    },
    queue: [],
  });

export const decodeNexus = (hydrant: Hydrant): Nexus =>
  ({
    id     : hydrant.id,
    props  : hydrant.props,
    strands: Record.map(hydrant.strands, (stack) =>
      ({
        rc   : 1,
        pc   : 0,
        stack,
        saved: structuredClone(stack),
        queue: [],
      }),
    ),
    next: {
      id   : hydrant.id,
      props: hydrant.props,
    },
    queue: [],
  });

export const encodeNexus = (self: Nexus): Hydrant =>
  ({
    id     : self.id,
    props  : self.props,
    strands: Record.map(self.strands, (node) => node.stack),
  });

export const cloneNexus = (self: Nexus): Nexus => {
  const {root, strands, ...rest} = self;

  const cloned = structuredClone(rest) as Nexus;
  cloned.strands = Record.map(strands, (node) => cloneStrand(node));
  return cloned;
};

export namespace λ {
  const NODE = {current: null as Strand | null};
  export const get = () => NODE.current!;
  export const set = (node: Strand) => {NODE.current = node;};
  export const clear = () => {NODE.current = null;};
}
