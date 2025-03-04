import {Data, Equal} from 'effect';



export type T = {
  pc   : number;
  stack: any[];
  prior: any[];
  rc   : number;
  queue: any[];
};

export const isSame = (self: T) => {
  const stackData = Data.array(self.stack.map((s) => Data.struct(s)));
  const priorData = Data.array(self.prior.map((s) => Data.struct(s)));

  return Equal.equals(stackData, priorData);
};

export const make = (): T => ({
  pc   : 0,
  stack: [] as any[],
  prior: [] as any[],
  rc   : 0,
  queue: [] as any[],
});

export const commit = (self: T): T => {
  self.prior = structuredClone(self.stack);
  return self;
};

export const clone = (self: T): T => {
  const {queue, ...rest} = self;
  return {
    ...structuredClone(rest),
    queue,
  };
};
