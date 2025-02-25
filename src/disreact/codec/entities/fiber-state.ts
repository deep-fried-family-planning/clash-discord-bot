import {Data} from 'effect';
import {Equal} from 'effect';


export type Type = {
  pc   : number;
  stack: any[];
  prior: any[];
  rc   : number;
  queue: any[];

  circular: {
    node: any;
    refs: any[];
  };
};



export const make = (): Type => ({
  pc   : 0,
  stack: [] as any[],
  prior: [] as any[],
  rc   : 0,
  queue: [] as any[],

  circular: {
    node: null as any,
    refs: [] as any[],
  },
});



export const savePrior = (node: Type) => {
  node.prior = structuredClone(node.stack);
  return node;
};



export const isSameState = (node: Type) => {
  const stackData = Data.array(node.stack.map((s) => Data.struct(s)));
  const priorData = Data.array(node.prior.map((s) => Data.struct(s)));

  return Equal.equals(stackData, priorData);
};
