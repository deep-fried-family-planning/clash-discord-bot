import {Elem} from '#src/disreact/model/entity/elem.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import {Tether} from '#src/disreact/model/entity/tether.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import * as MsgPack from '@msgpack/msgpack';
import {pipe} from 'effect';
import * as pako from 'pako';

export const TypeId = Symbol('disreact/Rehydrant');

export * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
export type Rehydrant = {
  [TypeId]: string | number | symbol;
  id      : string;
  elem    : Elem;
  nexus   : Tether.Nexus;
  key     : string;
};

export type Source = {
  [TypeId]: string;
  id      : string;
  elem    : Elem;
};

export const source = (src: Elem | FC): Source => {
  if (Elem.isTask(src)) {
    const fc = FC.source(src.type);

    return {
      [TypeId]: '',
      id      : FC.getSrcId(fc),
      elem    : Elem.cloneElem(src),
    };
  }

  if (!FC.isFC(src)) {
    throw new Error();
  }

  const fc = FC.source(src);

  return {
    [TypeId]: '',
    id      : FC.getSrcId(fc),
    elem    : Elem.jsxTask(fc, {}),
  };
};

export const make = (src: Source, props?: any): Rehydrant => {
  const elem = Elem.cloneElem(src.elem);
  elem.props = props;
  const nexus = Tether.makeNexus(props);
  elem.id = src.id;

  if (Elem.isTask(elem)) {
    elem.strand.nexus = nexus;
    elem.strand.elem = elem;
    nexus.strands[elem.id] = elem.strand;
  }

  nexus.id = src.id;
  nexus.next.id = src.id;
  nexus.next.props = elem.props;
  nexus.root = {
    [TypeId]: '',
    key     : '',
    id      : elem.id,
    elem    : elem,
    nexus   : nexus,
  };

  return nexus.root;
};

export const rehydrate = (src: Source, dehydrated: Dehydrated) => {
  const rehydrant = make(src, dehydrated.props);
  rehydrant.nexus = Tether.decodeNexus(dehydrated);

  if (Elem.isTask(rehydrant.elem)) {
    rehydrant.elem.strand = rehydrant.nexus.strands[rehydrant.elem.id!];
  }

  return rehydrant;
};

export const dehydrate = (self: Rehydrant): Dehydrated => {
  return Tether.encodeNexus(self.nexus);
};

export const clone = (self: Rehydrant) => {
  const {elem, nexus, ...rest} = self;

  const cloned = structuredClone(rest) as Rehydrant;
  cloned.nexus = Tether.cloneNexus(self.nexus);
  cloned.elem = Elem.deepCloneElem(self.elem);
  return cloned;
};

export const linear = (self: Rehydrant): Rehydrant => {
  delete self.nexus.root;
  delete self.nexus.request;
  Elem.linearizeElem(self.elem);
  return self;
};

export const mount = (root: Rehydrant, elem: Elem) => {
  if (Elem.isTask(elem)) {
    elem.strand.nexus = root.nexus;
    elem.strand.elem = elem;
    root.nexus.strands[elem.id!] = elem.strand;
  }
};

export const mountTask = (root: Rehydrant, elem: Elem.Task) => {
  elem.strand.nexus = root.nexus;
  elem.strand.elem = elem;
  root.nexus.strands[elem.id!] = elem.strand;
};

export const dismountTask = (root: Rehydrant, elem: Elem.Task) => {
  delete elem.strand.elem;
  delete elem.strand.nexus;
  delete root.nexus.strands[elem.id!];
};

export type Encoded = typeof Encoded.Type;
export const Encoded = S.String;

export type Dehydrated = typeof Dehydrated.Type;
export const Dehydrated = S.Struct({
  id     : S.String,
  props  : S.optional(S.Any),
  strands: S.Record({key: S.String, value: Tether.Chain}),
});

export const Hydrator = S.transform(Encoded, Dehydrated, {
  encode: (hydrant) =>
    pipe(
      MsgPack.encode(hydrant),
      pako.deflate,
      (binary) => Buffer.from(binary).toString('base64url'),
    ),
  decode: (hash) =>
    pipe(
      Buffer.from(hash, 'base64url'),
      pako.inflate,
      MsgPack.decode,
    ) as any,
});
