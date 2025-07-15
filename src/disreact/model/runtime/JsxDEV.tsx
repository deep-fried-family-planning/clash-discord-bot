import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import {make, makeMulti, type Setup, type Type} from '#disreact/model/runtime/Jsx.tsx';

export const Fragment = Jsx.Fragment;

export type DevSrc = {};

export type DevCtx = {};

export const makeDEV = (
  type: Jsx.Type,
  setup: Jsx.Setup,
  key: string | undefined,
  src: DevSrc,
  ctx: DevCtx,
): Jsx.Jsx => {
  let elem: Jsx.Jsx;
  if (Array.isArray(setup.children)) {
    elem = Jsx.makeMulti(type, setup, key);
  }
  else {
    elem = Jsx.make(type, setup, key);
  }
  return elem;
};
