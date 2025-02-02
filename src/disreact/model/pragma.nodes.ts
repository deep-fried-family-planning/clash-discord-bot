/* eslint-disable @typescript-eslint/no-explicit-any */
import type {FiberState} from '#src/disreact/internal/dispatch-hooks.ts';

export type RenderFunction = (props: any) => any;

type Common = {
  index  : number;
  name   : string;
  id     : string;
  id_step: string;
  id_full: string;
};

export type PragmaText = {
  kind : 'text';
  value: string;
};

export type PragmaIntrinsic = Common & {
  kind    : 'intrinsic';
  props   : Record<string, any>;
  children: Pragma[];
};

export type PragmaFunction = Common & {
  kind    : 'function';
  props   : Record<string, any>;
  children: Pragma[];
  render  : RenderFunction;
  state?  : FiberState;
};

export type Pragma =
  | PragmaText
  | PragmaIntrinsic
  | PragmaFunction;
