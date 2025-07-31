import type * as Jsx from '#disreact/model/internal/Jsx.tsx';
import * as JsxRuntime from '#disreact/model/runtime/JsxRuntime.tsx';
import * as Effect from 'effect/Effect';

export const Fragment = JsxRuntime.Fragment;

export interface JsxDEV extends Jsx.Jsx {
  src: any;
  ctx: any;
}

export const makeDEV = (
  type: Jsx.Type,
  setup: JsxRuntime.Setup,
  key: JsxRuntime.Key,
  src: JsxDEV['src'],
  ctx: JsxDEV['ctx'],
) => {
  let elem: Jsx.Jsx;

  if (Array.isArray(setup.children)) {
    elem = JsxRuntime.jsx(type, setup, key);
  }
  else {
    elem = JsxRuntime.jsxs(type, setup, key);
  }
  (elem as JsxDEV).src = src;
  (elem as JsxDEV).ctx = ctx;
  return elem;
};
