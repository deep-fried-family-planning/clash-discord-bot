export namespace Progress {
  export type Exit = {
    _tag: 'exit';
  };
  export type Same = {
    _tag: 'same';
  };
  export type Next = {
    _tag: 'next';
    id  : string;
  };
  export type Part = {
    _tag : 'part';
    id   : string;
    type : string;
    props: any;
  };
  export type Progress = | Exit
                         | Same
                         | Next
                         | Part;
}
export type Exit = Progress.Exit;
export type Same = Progress.Same;
export type Next = Progress.Next;
export type Part = Progress.Part;
export type Progress = Progress.Progress;

export const isExit = (p: Progress.Progress): p is Progress.Exit => p._tag === 'exit';
export const isSame = (p: Progress.Progress): p is Progress.Same => p._tag === 'same';
export const isNext = (p: Progress.Progress): p is Progress.Next => p._tag === 'next';
export const isPart = (p: Progress.Progress): p is Progress.Part => p._tag === 'part';

export const exit = (): Progress.Exit =>
  ({
    _tag: 'exit',
  });

export const same = (): Progress.Same =>
  ({
    _tag: 'same',
  });

export const next = (id: string): Progress.Next =>
  ({
    _tag: 'next',
    id,
  });

export const part = (id: string, type: string, props: any): Progress.Part =>
  ({
    _tag: 'part',
    id,
    type,
    props,
  });
