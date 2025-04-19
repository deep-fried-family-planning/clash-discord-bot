import {Elem} from '#src/disreact/model/elem/elem.ts';
import {FC} from '#src/disreact/model/elem/fc.ts';

export * as Source from './source.ts';
export type Source = {
  id  : string;
  elem: Elem;
};

export type Registrant = Elem | FC;

const fromElem = (elem: Elem, id?: string): Source => {
  if (Elem.isValue(elem)) {
    throw new Error('Source element cannot be a value');
  }

  if (Elem.isFragment(elem)) {
    if (!id) {
      throw new Error('Source fragment must have a given id');
    }

    const clone = Elem.cloneFragment(elem);
    clone.id = id;

    return {
      id,
      elem: clone,
    };
  }

  if (Elem.isRest(elem)) {
    if (!id) {
      throw new Error('Source rest element must have a given id');
    }

    const clone = Elem.cloneRest(elem);
    clone.id = id;

    return {
      id,
      elem: clone,
    };
  }

  if (!id && FC.isAnonymous(elem.type)) {
    throw new Error('Source function component cannot be named Anonymous');
  }

  const clone = Elem.cloneTask(elem);
  clone.id = id ?? FC.getName(elem.type);

  return {
    id  : clone.id,
    elem: clone,
  };
};

const fromFC = (src: FC, id?: string): Source => {
  if (!id && FC.isAnonymous(src)) {
    throw new Error('Source function component cannot be named Anonymous');
  }

  const elem = Elem.makeTask(src, {});
  elem.id = id ?? FC.getName(src);

  return {
    id: elem.id,
    elem,
  };
};

export const make = (src: Elem | FC, id?: string): Source =>
  FC.isFC(src)
    ? fromFC(src, id)
    : fromElem(src, id);

export type Key = Source | Elem | FC | string;

export const resolveId = (key: Key): string => {
  if (typeof key === 'string') {
    return key;
  }
  if (FC.isFC(key)) {
    return FC.getName(key);
  }
  if (typeof key !== 'object') {
    throw new Error('Source key cannot be a value element');
  }
  if (key.id) {
    return key.id;
  }
  throw new Error('Source key must have an id');
};
