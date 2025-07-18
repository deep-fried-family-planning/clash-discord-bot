export type Progress<
  PData = any,
  CData = any,
> =
  | Start
  | Change
  | Partial<PData>
  | Checkpoint<CData>
  | Done;

const Proto: Progress = {
  _tag: 'Start',
  id  : '',
  next: undefined,
  data: undefined,
} as Progress;

export type Start = {
  _tag: 'Start';
};

export type Change = {
  _tag: 'Change';
  id  : string;
  next: string | null;
};

export type Partial<A = any> = {
  _tag: 'Partial';
  id  : string;
  data: A;
};

export type Checkpoint<A = any> = {
  _tag: 'Checkpoint';
  id  : string;
  data: A;
};

export type Done = {
  _tag: 'Done';
};

export const start = (): Start => Proto as Start;

const ChangeProto: Change = Object.assign(Object.create(Proto), {
  _tag: 'Change',
});

export const change = (id: string, next: string | null): Change => {
  const self = Object.create(ChangeProto) as Change;
  self.id = id;
  self.next = next;
  return self;
};

const PartialProto: Partial<any> = Object.assign(Object.create(Proto), {
  _tag: 'Partial',
});

export const partial = <A = any>(id: string, data: A): Partial<A> => {
  const self = Object.create(PartialProto) as Partial<A>;
  self.id = id;
  self.data = data;
  return self;
};

const CheckpointProto: Checkpoint<any> = Object.assign(Object.create(Proto), {
  _tag: 'Checkpoint',
});

export const checkpoint = <A = any>(id: string, data: A): Checkpoint<A> => {
  const self = Object.create(CheckpointProto) as Checkpoint<A>;
  self.id = id;
  self.data = data;
  return self;
};

const DoneProto: Done = Object.assign(Object.create(Proto), {
  _tag: 'Done',
});

export const done = (): Done => {
  const self = Object.create(DoneProto) as Done;
  return self;
};

export const isClose = (change: Change) => change.next === null;

export const isOpen = (change: Change) => change.next !== change.id;
