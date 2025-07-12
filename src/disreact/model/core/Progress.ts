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
  _tag      : 'Start',
  entrypoint: '',
  next      : undefined,
  data      : undefined,
} as Progress;

export type Start = {
  _tag: 'Start';
};

export type Change = {
  _tag      : 'Change';
  entrypoint: string;
  next      : string | null;
};

export type Partial<A = any> = {
  _tag      : 'Partial';
  entrypoint: string;
  data      : A;
};

export type Checkpoint<A = any> = {
  _tag      : 'Checkpoint';
  entrypoint: string;
  data      : A;
};

export type Done = {
  _tag: 'Done';
};

export const start = (): Start => Proto as Start;

export const change = (entrypoint: string, next: string | null): Change => {
  const self = Object.create(Proto) as Change;
  self._tag = 'Change';
  self.entrypoint = entrypoint;
  self.next = next;
  return self;
};

export const partial = <A = any>(entrypoint: string, data: A): Partial<A> => {
  const self = Object.create(Proto) as Partial<A>;
  self._tag = 'Partial';
  self.entrypoint = entrypoint;
  self.data = data;
  return self;
};

export const checkpoint = <A = any>(entrypoint: string, data: A): Checkpoint<A> => {
  const self = Object.create(Proto) as Checkpoint<A>;
  self._tag = 'Checkpoint';
  self.entrypoint = entrypoint;
  self.data = data;
  return self;
};

export const done = (): Done => {
  const self = Object.create(Proto) as Done;
  self._tag = 'Done';
  return self;
};
