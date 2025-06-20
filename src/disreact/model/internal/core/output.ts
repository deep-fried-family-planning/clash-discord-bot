import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';

export const PART = 1,
             SAME = 2,
             NEXT = 3,
             EXIT = 4;

export type Part = {
  _tag : typeof PART;
  id   : string;
  type : string;
  props: any;
};

export type Same = {
  _tag: typeof SAME;
};

export type Next = {
  _tag: typeof NEXT;
  id  : string;
};

export type Exit = {
  _tag: typeof EXIT;
};

export type Output = | Part
                     | Same
                     | Next
                     | Exit;

const Part = proto.declare<Part>({
  _tag: PART,
});

const Same = proto.declare<Same>({
  _tag: SAME,
});

const Next = proto.declare<Next>({
  _tag: NEXT,
});

const Exit = proto.declare<Exit>({
  _tag: EXIT,
});

export const part = (id: string, type: string, props: any): Part =>
  proto.instance(Part, {
    id   : id,
    type : type,
    props: props,
  });

export const same = (): Same => Same;

export const next = (id: string): Next =>
  proto.instance(Next, {
    id: id,
  });

export const exit = (): Exit => Exit;
