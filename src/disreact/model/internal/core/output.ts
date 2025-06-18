import * as Prototype from '#src/disreact/model/internal/infrastructure/prototype.ts';

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

export type Output =
  | Part
  | Same
  | Next
  | Exit;

const Part = Prototype.declare<Part>({
  _tag: PART,
});

const Same = Prototype.declare<Same>({
  _tag: SAME,
});

const Next = Prototype.declare<Next>({
  _tag: NEXT,
});

const Exit = Prototype.declare<Exit>({
  _tag: EXIT,
});

export const part = (id: string, type: string, props: any): Part =>
  Prototype.instance(Part, {
    id   : id,
    type : type,
    props: props,
  });

export const same = (): Same => Same;

export const next = (id: string): Next =>
  Prototype.instance(Next, {
    id: id,
  });

export const exit = (): Exit => Exit;
