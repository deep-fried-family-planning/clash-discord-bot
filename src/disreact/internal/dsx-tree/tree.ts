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

  e: {
    cs: Tree[];
    up: Tree | null;
    dn: Tree | null;
    lt: Tree | null;
    rt: Tree | null;
  };

  v: {
    props  : Record<string, any>;
    string?: string;
    fn?: {
      render: (p: Record<string, any>) => E.Effect<Tree[], any, any>;
      state : any;
      stack : any[];
    };
  };
};
