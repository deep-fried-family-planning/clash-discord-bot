import type * as Jsx from '#disreact/engine/entity/Jsx.ts';
import * as JsxRuntime from '#disreact/engine/runtime/JsxRuntime.tsx';
import  * as DiscordJsx from '#disreact/codec/DiscordJsx.ts';

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

  if (typeof elem.type === 'string') {
    DiscordJsx.jsxValidateDEV(elem);
  }

  return elem;
};
