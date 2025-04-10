import {Elem} from '#src/disreact/model/entity/elem.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';

export const Id = Symbol('disreact/Root');

export * as Root from '#src/disreact/model/entity/root.ts';
export type Root = Source & {
  nexus: Fibril.Nexus;
};

export interface Source {
  _tag: Type;
  id  : string;
  elem: Elem;
}

export const MODAL     = 'Modal',
             PUBLIC    = 'Public',
             EPHEMERAL = 'Ephemeral';

export type Type =
  | typeof MODAL
  | typeof PUBLIC
  | typeof EPHEMERAL;

export const make = (_tag: Type, src: Elem | FC): Source => {
  if (Elem.isTask(src)) {
    const fc = FC.initSource(src.type);

    return {
      _tag,
      id  : FC.getSrcId(fc),
      elem: Elem.cloneElem(src),
    };
  }

  if (!FC.isFC(src)) {
    throw new Error();
  }

  const fc = FC.initSource(src);

  return {
    _tag,
    id  : FC.getSrcId(fc),
    elem: Elem.jsxTask(fc, {}),
  };
};

export const mountElem = (root: Root, elem: Elem) => {
  if (Elem.isTask(elem)) {
    elem.strand.nexus = root.nexus;
    elem.strand.elem = elem;
    root.nexus.strands[elem.id!] = elem.strand;
  }
};

export const mountTask = (root: Root, elem: Elem.Task) => {
  elem.strand.nexus = root.nexus;
  elem.strand.elem = elem;
  root.nexus.strands[elem.id!] = elem.strand;
};

export const dismountTask = (root: Root, elem: Elem.Task) => {
  delete elem.strand.elem;
  delete elem.strand.nexus;
  delete root.nexus.strands[elem.id!];
};

export const fromSource = (src: Source, props?: any): Root => {
  const elem = Elem.cloneElem(src.elem);
  elem.props = props;
  const nexus = Fibril.makeNexus(props);
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
    _tag : src._tag,
    id   : elem.id,
    elem : elem,
    nexus: nexus,
  };

  return nexus.root;
};

export const fromSourceHydrant = (src: Source, hydrant: Fibril.Hydrant) => {
  const root = fromSource(src, hydrant.props);
  root.nexus = Fibril.decodeNexus(hydrant);
  if (Elem.isTask(root.elem)) {
    root.elem.strand = root.nexus.strands[root.elem.id!];
  }
  return root;
};

export const deepClone = (self: Root) => {
  const {elem, nexus, ...rest} = self;

  const cloned = structuredClone(rest) as Root;
  cloned.nexus = Fibril.cloneNexus(self.nexus);
  cloned.elem = Elem.deepCloneElem(self.elem);
  return cloned;
};

export const deepLinearize = (self: Root): Root => {
  delete self.nexus.root;
  delete self.nexus.request;
  Elem.linearizeElem(self.elem);
  return self;
};
