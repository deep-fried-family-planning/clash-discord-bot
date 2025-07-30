export type Progress<
  PData = any,
  CData = any,
> =
  | Start
  | Change
  | Partial<PData>
  | Checkpoint<CData>
  | Done;

export type Start = {
  _tag: 'Start';
};

export type Change = {
  _tag: 'Change';
  type: 'Same' | 'Next' | 'Exit';
  id  : string | undefined;
};

export type Partial<A = any> = {
  _tag: 'Partial';
  id  : string;
  data: A;
};

export type Checkpoint<A = any> = {
  _tag : 'Checkpoint';
  stage: 'Initialize' | 'Hydrate' | 'Rerender';
  id   : string;
  data : A;
};

export type Done = {
  _tag: 'Done';
};

const Proto: Progress = {
  _tag : 'Start',
  id   : '',
  type : undefined,
  stage: undefined,
  data : undefined,
} as Progress;

const ChangeProto: Change = Object.assign(Object.create(Proto), {
  _tag: 'Change',
});

const PartialProto: Partial<any> = Object.assign(Object.create(Proto), {
  _tag: 'Partial',
});

const CheckpointProto: Checkpoint<any> = Object.assign(Object.create(Proto), {
  _tag: 'Checkpoint',
});

const DoneProto: Done = Object.assign(Object.create(Proto), {
  _tag: 'Done',
});

export const start = (): Start => Proto as Start;

export const change = (id: string, type: Change['type']): Change => {
  const self = Object.create(ChangeProto) as Change;
  self.id = id;
  self.type = type;
  return self;
};

export const partial = <A = any>(id: string, data: A): Partial<A> => {
  const self = Object.create(PartialProto) as Partial<A>;
  self.id = id;
  self.data = data;
  return self;
};

export const checkpoint = <A = any>(id: string, data: A): Checkpoint<A> => {
  const self = Object.create(CheckpointProto) as Checkpoint<A>;
  self.id = id;
  self.data = data;
  return self;
};

export const done = (): Done => {
  const self = Object.create(DoneProto) as Done;
  return self;
};
