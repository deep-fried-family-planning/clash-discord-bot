import * as JsxRuntime from '#disreact/model/runtime/Jsx.tsx';

export const Fragment = JsxRuntime.Fragment;

export interface JsxDEV extends JsxRuntime.Jsx {
  src: any;
  ctx: any;
}

export const makeDEV = (
  type: JsxRuntime.Type,
  setup: JsxRuntime.Setup,
  key: JsxRuntime.Key,
  src: JsxDEV['src'],
  ctx: JsxDEV['ctx'],
) => {
  let elem: JsxRuntime.Jsx;

  if (Array.isArray(setup.children)) {
    elem = JsxRuntime.makeJsxs(type, setup, key);
  }
  else {
    elem = JsxRuntime.makeJsx(type, setup, key);
  }
  (elem as JsxDEV).src = src;
  (elem as JsxDEV).ctx = ctx;
  return elem;
};

export const encodeDEV = (jsx: JsxRuntime.Jsx) => {

};
