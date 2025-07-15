import * as Jsx from '#disreact/model/runtime/Jsx.tsx';

export const Fragment = Jsx.Fragment;

export interface JsxDEV extends Jsx.Jsx {
  src: any;
  ctx: any;
}

export const makeDEV = (
  type: Jsx.Type,
  setup: Jsx.Setup,
  key: Jsx.Key,
  src: JsxDEV['src'],
  ctx: JsxDEV['ctx'],
): Jsx.Jsx => {
  let elem: Jsx.Jsx;

  if (Array.isArray(setup.children)) {
    elem = Jsx.makeMulti(type, setup, key);
  }
  else {
    elem = Jsx.make(type, setup, key);
  }
  (elem as JsxDEV).src = src;
  (elem as JsxDEV).ctx = ctx;
  return elem;
};
