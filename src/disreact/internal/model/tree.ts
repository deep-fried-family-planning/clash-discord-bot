/* eslint-disable @typescript-eslint/no-explicit-any */
import type {E} from '#src/internal/pure/effect.ts';



export type TreeId = {
  ptr : symbol;
  idx : number;
  name: string;
  step: string;
  full: string;
};



export type Tree = {
  id: TreeId;

  up   : Tree | null;
  down : Tree | null;
  prev : Tree | null;
  next : Tree | null;
  nodes: Tree[];

  fn?: {
    render: (p: Record<string, any>) => E.Effect<Tree[], any, any>;
    state : any;
    stack : any[];
  };

  props: Record<string, any>;
  value: string;
};
