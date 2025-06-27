import * as FC from '#src/disreact/model/runtime/fc.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';

export type Primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | symbol;

export const Fragment = Symbol.for('disreact/fragment');

const TypeId = Symbol.for('disreact/jsx');
const JsxDEV = Symbol.for('disreact/jsxDEV');

export const INTRINSIC = 1,
             FUNCTION  = 2;

export interface Precursor {
  [TypeId]  : number;
  [JsxDEV]? : typeof JsxDEV;
  _tag      : typeof Fragment | typeof INTRINSIC | typeof FUNCTION;
  component?: any;
  props?    : any;
}

export const isPrecursor = (u: unknown): u is Precursor =>
  typeof u === 'object'
  && u !== null
  && TypeId in u;

const Prototype = proto.type<Precursor>({
  [TypeId] : 0,
  _tag     : INTRINSIC,
  component: undefined,
  props    : undefined,
});

export type Jsx =
  | Primitive
  | Precursor;

export const childs = (p: Precursor): Jsx[] => {
  switch (p[TypeId]) {
    case 0:
      return [];
    case 1:
      return [p.props.children];
    default:
      return p.props.children;
  }
};

export const make = (_tag: any, props: any, len: number): Precursor => {
  const self = proto.init(Prototype, {});
  self[TypeId] = len;
  self.props = props;

  if (_tag === Fragment) {
    self._tag = Fragment;
    return self;
  }

  switch (typeof _tag) {
    case 'string': {
      self.component = _tag;
      return self;
    }
    case 'function': {
      self._tag = FUNCTION;
      self.component = FC.register(_tag);
      return self;
    }
  }
  throw new Error(`Invalid type: ${_tag}`);
};

export const jsx = (_tag: any, props: any): Precursor => {
  const self = make(_tag, props, props.children ? 1 : 0);

  return self;
};

export const jsxs = (_tag: any, props: any): Precursor => {
  return make(_tag, props, props.children.length);
};

export const jsxDEV = (_tag: any, props: any): Precursor => {
  const self = make(_tag, props, 0);
  self[JsxDEV] = JsxDEV;

  if (!props.children) {
    return self;
  }
  if (props.children.length) {
    self[TypeId] = props.children.length;
    return self;
  }
  self[TypeId] = 1;
  return self;
};
