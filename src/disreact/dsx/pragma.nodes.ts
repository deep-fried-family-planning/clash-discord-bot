/* eslint-disable @typescript-eslint/no-explicit-any */
import type {FiberState} from '#src/disreact/internal/hooks.ts';

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
  name : 'string';
  value: string;
};

export type PragmaElement = Common & {
  kind    : 'intrinsic';
  name    : keyof JSX.IntrinsicElements;
  props   : Record<string, any>;
  children: Pragma[];
};

export type PragmaFunction = Common & {
  kind    : 'function';
  props   : Record<string, any>;
  children: Pragma[];
  render  : RenderFunction;
  state?  : FiberState;
  root?   : boolean;
};

export type Pragma =
  | PragmaText
  | PragmaElement
  | PragmaFunction;
