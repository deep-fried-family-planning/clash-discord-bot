import * as proto from '#disreact/core/behaviors/proto.ts';

export const PARTIAL_NODE  = 1,
             SAME_ENDPOINT = 2,
             NEXT_ENDPOINT = 3,
             EXIT_ENDPOINT = 4,
             CHECKPOINT    = 5;

export type Part = {
  _tag    : typeof PARTIAL_NODE;
  endpoint: string;
  type    : string;
  props   : any;
};

export type Same = {
  _tag    : typeof SAME_ENDPOINT;
  endpoint: string;
};

export type Next = {
  _tag    : typeof NEXT_ENDPOINT;
  endpoint: string;
};

export type Exit = {
  _tag    : typeof EXIT_ENDPOINT;
  endpoint: string;
};

export type Checkpoint<D = any> = {
  _tag    : typeof CHECKPOINT;
  endpoint: string;
  props   : any;
  state   : any;
  data    : D;
};

export type Output = | Part
                     | Same
                     | Next
                     | Exit
                     | Checkpoint;

const Part = proto.type<Part>({
  _tag: PARTIAL_NODE,
});

const Same = proto.type<Same>({
  _tag: SAME_ENDPOINT,
});

const Next = proto.type<Next>({
  _tag: NEXT_ENDPOINT,
});

const Exit = proto.type<Exit>({
  _tag: EXIT_ENDPOINT,
});

const Checkpoint = proto.type<Checkpoint>({
  _tag: CHECKPOINT,
});

export const part = (endpoint: string, type: string, props: any): Part =>
  proto.init(Part, {
    endpoint: endpoint,
    type    : type,
    props   : props,
  });

export const same = (endpoint: string): Same =>
  proto.init(Same, {
    endpoint: endpoint,
  });

export const next = (endpoint: string): Next =>
  proto.init(Next, {
    endpoint: endpoint,
  });

export const exit = (endpoint: string): Exit =>
  proto.init(Exit, {
    endpoint: endpoint,
  });

export const checkpoint = <D>(endpoint: string, data: D): Checkpoint<D> =>
  proto.init(Checkpoint, {
    endpoint: endpoint,
    data    : data,
  });
