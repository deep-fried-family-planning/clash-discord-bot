import {Elem} from '#src/disreact/model/elem/elem.ts';
import {Lifecycle} from '#src/disreact/model/lifecycle.ts';
import {FC} from '#src/disreact/model/meta/fc.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {decode, encode} from '@msgpack/msgpack';
import {MutableList, Record} from 'effect';
import {deflate, inflate} from 'pako';

export * as Rehydrant from '#src/disreact/model/meta/rehydrant.ts';
export type Rehydrant = {
  id      : string;
  props?  : any;
  elem    : Elem.Node;
  next    : {id: string | null; props?: any};
  data    : any;
  fibrils : {[id: string]: Fibril};
  mount   : MutableList.MutableList<Elem.Node>;
  dismount: MutableList.MutableList<Elem.Node>;
  diffs   : MutableList.MutableList<[Elem, Elem]>;
  render  : MutableList.MutableList<[Elem, Elem] | [Elem.Task, number]>;
};

export const make = (src: Source, props?: any): Rehydrant => {
  const elem = Lifecycle.clone(src.elem);
  elem.props = props;
  elem.id = src.id;

  const rehydrant: Rehydrant = {
    id      : src.id,
    props   : props,
    elem    : elem,
    next    : {id: src.id},
    data    : {},
    fibrils : {},
    mount   : MutableList.empty(),
    dismount: MutableList.empty(),
    diffs   : MutableList.empty(),
    render  : MutableList.empty(),
  };

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

export const dehydrate = (rehydrant: Rehydrant): Decoded => ({
  id    : rehydrant.id,
  props : rehydrant.props,
  stacks: Record.map(rehydrant.fibrils, (fibril) => fibril.stack),
});

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

export const mountTask = (root: Rehydrant, elem: Elem.Task) => {
  elem.fibril.rehydrant = root;
  elem.fibril.elem = elem;
  root.fibrils[elem.id!] = elem.fibril;
};

export type Source = {
  id  : string;
  elem: Elem.Node;
};

export const makeSource = (src: Elem | FC): Source => {
  if (FC.isFC(src)) {
    const fc = FC.make(src);

    if (FC.isAnonymous(fc)) throw new Error();

    return {
      id  : FC.getName(fc),
      elem: Elem.makeTask(fc, {}),
    };
  }

  if (Elem.isValue(src)) throw new Error();
  if (Elem.isFragment(src)) throw new Error();
  if (Elem.isRest(src)) throw new Error();
  if (FC.isAnonymous(src.type)) throw new Error();

  return {
    id  : FC.getName(src.type),
    elem: Lifecycle.clone(src),
  };
};
