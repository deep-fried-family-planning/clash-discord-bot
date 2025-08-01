import * as JsxDEV from '#disreact/engine/runtime/JsxDEV.tsx';
import type * as DiscordJsx from '#disreact/codec/DiscordJsx.ts';

export const Fragment = JsxDEV.Fragment,
             jsxDEV   = JsxDEV.makeDEV;

declare global {
  namespace JSX {
    export interface IntrinsicElements extends DiscordJsx.Elements {}
  }
}
