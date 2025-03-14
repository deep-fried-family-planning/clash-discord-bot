import type {RestElement} from '#src/disreact/model/element/rest.ts';
import {TaskElem} from '#src/disreact/model/element/task.ts';
import {Elem} from '#src/disreact/model/element/element.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import type {Hydrant} from '#src/disreact/model/entity/fiber-hydrant.ts';
import {FiberStore} from '#src/disreact/model/entity/fiber-store.ts';



export * as Root from '#src/disreact/model/entity/root.ts';

export type Root = {
  _tag   : Type;
  id     : Hydrant.Id;
  element: TaskElem | RestElement;
  store  : FiberStore;
};

export interface Source {
  _tag   : Type;
  id     : string;
  element: TaskElem | RestElement;
}

export const MODAL     = 'Modal';
export const PUBLIC    = 'Public';
export const EPHEMERAL = 'Ephemeral';

export type Type =
  | typeof MODAL
  | typeof PUBLIC
  | typeof EPHEMERAL;

export const make = (_tag: Type, src: Elem | FC): Source => {
  if (FC.isFC(src)) {
    const fc = FC.initRoot(src);

    return {
      _tag,
      id     : FC.getSrcId(fc),
      element: TaskElem.make(fc),
    };
  }

  if (TaskElem.is(src)) {
    const fc = FC.initRoot(src.type);

    return {
      _tag,
      id     : FC.getSrcId(fc),
      element: Elem.clone(src),
    };
  }

  // @ts-expect-error convenience
  throw new Error(`Invalid Source: ${src.type} is not allowed (${src.id})`);
};

export const fromSource = (src: Source, props?: any): Root => {
  const elem  = Elem.clone(src.element);
  const store = FiberStore.make(src.id, props);
  elem.id     = elem.idx = src.id;

  if (TaskElem.is(elem)) {
    elem.fiber.root       = store;
    elem.fiber.element    = elem;
    elem.fiber.id         = elem.id;
    store.fibers[elem.id] = elem.fiber;
  }

  store.element = {
    _tag   : src._tag,
    id     : elem.id,
    element: elem,
    store,
  };

  return store.element;
};

export const fromSourceHydrant = (src: Source, hydrant: Hydrant) => {
  const root = fromSource(src, hydrant.props);
  root.store = FiberStore.decode(src.id, hydrant);
  return root;
};

export const deepClone = (self: Root) => {
  const {element, store, ...rest} = self;

  const cloned   = structuredClone(rest) as Root;
  cloned.element = Elem.clone(self.element);
  cloned.store   = FiberStore.clone(self.store);
  return cloned;
};

export const cloneDeep = (self: Root) => {
  const cloned   = deepClone(self);
  cloned.element = Elem.deepClone(self.element);
  return cloned;
};

export const linearize = (self: Root): void => {
  delete self.store.element;
  delete self.store.request;
};

export const deepLinearize = (self: Root): Root => {
  linearize(self);
  Elem.linearize(self.element);
  return self;
};

export namespace λ_λ {
  const STORE = new Map<string, Source>();

  export const has = (id: string) => STORE.has(id);
  export const get = (id: string) => STORE.get(id);
  export const set = (id: string, src: Source) => STORE.set(id, src);
  export const bye = () => {STORE.clear()};
}
