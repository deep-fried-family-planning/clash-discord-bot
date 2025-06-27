import type * as Rehydrant from '#src/disreact/adaptor/codec/adaptor/exp/domain/old/envelope.ts';

export namespace Progress {
  export type Done = {
    _tag: 'done';
  };
  export type Exit = {
    _tag: 'exit';
  };
  export type Same = Rehydrant.Envelope & {
    _tag: 'same';
  };
  export type Next = {
    _tag : 'next';
    id   : string;
    props: any;
    data : any;
  };
  export type Part = {
    _tag : 'part';
    id   : string;
    type : string;
    props: any;
  };
  export type Progress = | Done
                         | Exit
                         | Same
                         | Next
                         | Part;
}
export type Done = Progress.Done;
export type Exit = Progress.Exit;
export type Same = Progress.Same;
export type Next = Progress.Next;
export type Part = Progress.Part;
export type Progress2 = Progress.Progress;

export const isDone = (p: Progress.Progress): p is Progress.Done => p._tag === 'done';

export const isExit = (p: Progress.Progress): p is Progress.Exit => p._tag === 'exit';

export const isSame = (p: Progress.Progress): p is Progress.Same => p._tag === 'same';

export const isNext = (p: Progress.Progress): p is Progress.Next => p._tag === 'next';

export const isPart = (p: Progress.Progress): p is Progress.Part => p._tag === 'part';

export const done = (): Progress.Done =>
  ({
    _tag: 'done',
  });

export const exit = (): Progress.Exit =>
  ({
    _tag: 'exit',
  });

export const same = (root: Rehydrant.Envelope): Progress.Same =>
  ({
    _tag: 'same',
    ...root,
  });

export const next = (root: Rehydrant.Envelope): Progress.Next =>
  ({
    _tag : 'next',
    id   : root.next.id!,
    props: root.next.props,
    data : root.data,
  });

export const part = (id: string, type: string, props: any): Progress.Part =>
  ({
    _tag: 'part',
    id,
    type,
    props,
  });
