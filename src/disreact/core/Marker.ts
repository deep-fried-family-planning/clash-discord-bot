import {declareSubtype, fromProto} from '#disreact/util/proto.ts';

export type Stages =
  | 'Initialize'
  | 'Hydrate'
  | 'Dispatch'
  | 'Rerender';

export type Phases =
  | 'Initialize'
  | 'Hydrate'
  | 'Render'
  | 'Mount'
  | 'Unmount';

export type Changes =
  | 'Same'
  | 'Next'
  | 'Exit';

export type Marker<PD = any, SD = any> =
  | Start
  | Change
  | Phase<PD>
  | Stage<SD>
  | Done;

export type Start = {
  _tag: 'Start';
  id  : string;
};

export type Phase<D = any, P = Phases> = {
  _tag : 'Phase';
  id   : string;
  label: P;
  data : D;
};

export type Stage<D = any, S = Stages> = {
  _tag : 'Stage';
  id   : string;
  label: S;
  data : D;
};

export type Change<C = Changes> = {
  _tag : 'Change';
  id   : string;
  label: C;
};

export type Done = {
  _tag: 'Done';
};

const Proto: Marker = {
  _tag : 'Start',
  id   : '',
  type : undefined,
  label: undefined,
  data : undefined,
} as Marker;

const PhasePrototype = declareSubtype<Phase, Marker>(Proto, {
  _tag: 'Phase',
});

const StagePrototype: Stage<any> = Object.assign(Object.create(Proto), {
  _tag: 'Stage',
});

const ChangeProto: Change = Object.assign(Object.create(Proto), {
  _tag: 'Change',
});

const DonePrototype: Done = Object.assign(Object.create(Proto), {
  _tag: 'Done',
});

export const start = (id: string): Start => {
  const self = Object.create(Proto) as Start;
  self.id = id;
  return self;
};

export const phase = <P = any, D = any>(id: string, label: P, data: D): Phase<D, P> => {
  const self = fromProto(PhasePrototype) as Phase<D, P>;
  self.id = id;
  self.label = label;
  self.data = data;
  return self;
};

export const stage = <D = any>(id: string, label: Stage['label'], data: D): Stage<D> => {
  const self = Object.create(StagePrototype) as Stage<D>;
  self.id = id;
  self.label = label;
  self.data = data;
  return self;
};

export const change = (id: string, label: Change['label']): Change => {
  const self = Object.create(ChangeProto) as Change;
  self.id = id;
  self.label = label;
  return self;
};

export const done = (): Done => {
  const self = Object.create(DonePrototype) as Done;
  return self;
};
