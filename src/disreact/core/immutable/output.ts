import * as proto from '#disreact/core/behaviors/proto.ts';

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

const Part = proto.type<Part>({
  _tag: PART,
});

const Same = proto.type<Same>({
  _tag: SAME,
});

const Next = proto.type<Next>({
  _tag: NEXT,
});

const Exit = proto.type<Exit>({
  _tag: EXIT,
});

export const part = (id: string, type: string, props: any): Part =>
  proto.init(Part, {
    id   : id,
    type : type,
    props: props,
  });

export const same = (): Same => Same;

export const next = (id: string): Next =>
  proto.init(Next, {
    id: id,
  });

export const exit = (): Exit => Exit;
