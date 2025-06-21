import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';

export const Type = Symbol.for('disreact/jsx');

export const TEXT = 0,
             REST = 1,
             FRAG = 2,
             FUNC = 3;

export type Text = | null
                   | undefined
                   | boolean
                   | number
                   | string
                   | symbol;

export interface Pragma {
  [Type]?   : typeof Type;
  _tag      : number;
  component?: any;
  child?    : Child;
  childs?   : Childs;
  props?    : any;
  pass      : number;
}

export type Child = | Text
                    | Pragma;

export type Childs = Child[];

export type Children = | Child
                       | Childs;

const Prototype = proto.declare<Pragma>({
  [Type]   : Type,
  _tag     : REST,
  component: undefined as any,
  child    : undefined as any,
  childs   : undefined as any,
  props    : undefined as any,
  pass     : 0,
});

export const isPragma = (u: unknown): u is Pragma =>
  typeof u === 'object'
  && u !== null
  && Type in u;

export const Fragment = undefined;

export const jsx = (type: any, props: any) => {
  const self = proto.instance(Prototype, {});
  delete self.childs;

  if (type === Fragment) {
    self._tag = FRAG;
    self.child = props.children;
    delete self.component;
    delete self.props;
    return self;
  }
  switch (typeof type) {
    case 'string': {
      self._tag = REST;
      self.component = type;
      self.props = props;
      self.child = props.children;
      return self;
    }
    case 'function': {
      self._tag = FUNC;
      self.component = FC.register(type);
      self.props = props;
      delete self.child;
      return self;
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxs = (type: any, props: any) => {
  const self = proto.instance(Prototype, {});
  delete self.child;

  if (type === Fragment) {
    self._tag = FRAG;
    self.childs = props.children;
    delete self.component;
    delete self.props;
    return self;
  }
  switch (typeof type) {
    case 'string': {
      self._tag = REST;
      self.component = type;
      self.props = props;
      self.childs = props.children;
      return self;
    }
    case 'function': {
      self._tag = FUNC;
      self.component = FC.register(type);
      self.props = props;
      delete self.childs;
      return self;
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxDEV = (type: any, props: any) => {
  throw new Error('Not implemented');
};
