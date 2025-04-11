import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {decode, encode} from '@msgpack/msgpack';
import {MutableList, Record} from 'effect';
import {deflate, inflate} from 'pako';
import type {Source} from './source';

export * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
export type Rehydrant = {
  id     : string;
  props? : any;
  elem   : Elem;
  next   : {id: string; props?: any};
  data   : any;
  fibrils: {[id: string]: Fibril};
  stack  : MutableList.MutableList<Elem>;
};

// const make = (id: string, props?: any) =>
//   ({
//     id,
//     props,
//     elem   : null as unknown as Elem,
//     next   : {id},
//     data   : {},
//     fibrils: {},
//     stack  : MutableList.make(),
//   });

export const makeRehydrant = (src: Source, props?: any): Rehydrant => {
  const elem = Elem.cloneElem(src.elem);
  elem.props = props;
  elem.id = src.id;

  return {
    id     : src.id,
    props  : props,
    elem   : elem,
    next   : {id: src.id},
    data   : {},
    fibrils: {},
    stack  : MutableList.make(),
  };
};

export const fromDecoded = (src: Source, decoded: Decoded) => {
  const elem = Elem.cloneElem(src.elem);
  elem.props = decoded.props;
  elem.id = src.id;

  return;
};

export const make = (src: Source, props?: any): Rehydrant => {
  const rehydrant = makeRehydrant(src, props);

  if (Elem.isTask(rehydrant.elem)) {
    rehydrant.elem.fibril.rehydrant = rehydrant;
    rehydrant.elem.fibril.elem = rehydrant.elem;
    rehydrant.fibrils[rehydrant.id] = rehydrant.elem.fibril;
  }

  return rehydrant;
};

export type Encoded = typeof Encoded.Type;
export const Encoded = S.String;

export type Decoded = typeof Decoded.Type;
export const Decoded = S.Struct({
  id    : S.String,
  props : S.optional(S.Any),
  stacks: S.Record({key: S.String, value: Fibril.Chain}),
});

export const Hydrator = S.transform(Encoded, Decoded, {
  encode: (dry) => {
    const pack = encode(dry);
    const pako = deflate(pack);
    return Buffer.from(pako).toString('base64url');
  },
  decode: (hash) => {
    const buff = Buffer.from(hash, 'base64url');
    const pako = inflate(buff);
    return decode(pako) as any;
  },
});

export const dehydrate = (rehydrant: Rehydrant): Decoded => {
  return {
    id    : rehydrant.id,
    props : rehydrant.props,
    stacks: Record.map(rehydrant.fibrils, (fibril) => fibril.stack),
  };
};

export const rehydrate = (src: Source, dehydrated: Decoded) => {
  const rehydrant = make(src, dehydrated.props);
  rehydrant.id = dehydrated.id;
  rehydrant.props = dehydrated.props;
  rehydrant.fibrils = Record.map(dehydrated.stacks, (stack, id) => Fibril.make(stack));

  if (Elem.isTask(rehydrant.elem)) {
    rehydrant.elem.fibril = rehydrant.fibrils[rehydrant.elem.id!];
  }

  return rehydrant;
};

export const mount = (root: Rehydrant, elem: Elem) => {
  if (Elem.isTask(elem)) {
    elem.fibril.rehydrant = root;
    elem.fibril.elem = elem;
    root.fibrils[elem.id!] = elem.fibril;
  }
};

export const mountTask = (root: Rehydrant, elem: Elem.Task) => {
  elem.fibril.rehydrant = root;
  elem.fibril.elem = elem;
  root.fibrils[elem.id!] = elem.fibril;
};

export const dismountTask = (root: Rehydrant, elem: Elem.Task) => {
  delete elem.fibril.elem;
  delete elem.fibril.rehydrant;
  delete root.fibrils[elem.id!];
};
