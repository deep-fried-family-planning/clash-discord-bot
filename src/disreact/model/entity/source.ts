import {Elem} from '#src/disreact/model/entity/elem.ts';
import {FC} from './fc.ts';

export * as Source from './source.ts';
export type Source = {
  id  : string;
  elem: Elem;
};

export const make = (src: Elem | FC): Source => {
  if (Elem.isPrim(src) || Elem.isRest(src)) throw new Error();

  if (Elem.isTask(src)) {
    if (FC.isAnonymous(src.type)) throw new Error();

    return {
      id  : FC.getName(src.type),
      elem: Elem.cloneElem(src),
    };
  }

  const fc = FC.make(src);

  if (FC.isAnonymous(fc)) throw new Error();

  return {
    id  : FC.getName(fc),
    elem: Object.freeze(Elem.jsxTask(fc, {})),
  };
};
