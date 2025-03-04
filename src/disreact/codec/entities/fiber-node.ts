import {Data, Equal} from 'effect';



export type FiberNode = {
  pc   : number;
  stack: any[];
  prior: any[];
  rc   : number;
  queue: any[];
};

export const make = (): FiberNode => ({
  pc   : 0,
  stack: [] as any[],
  prior: [] as any[],
  rc   : 0,
  queue: [] as any[],
});

export const savePrior = (node: FiberNode) => {
  node.prior = structuredClone(node.stack);
  return node;
};

export const isSameState = (node: FiberNode) => {
  const stackData = Data.array(node.stack.map((s) => Data.struct(s)));
  const priorData = Data.array(node.prior.map((s) => Data.struct(s)));

  return Equal.equals(stackData, priorData);
};
