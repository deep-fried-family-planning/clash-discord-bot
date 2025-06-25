import {FRAGMENT, FUNCTIONAL, INTRINSIC, JSX, JSXS, TEXT_NODE} from '#src/disreact/model/internal/core/constants.ts';
import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';

export const TypeId   = Symbol.for('disreact/jsx'),
             DevId    = Symbol.for('disreact/jsxDEV'),
             Fragment = Symbol.for('disreact/fragment');

export type Value = | null
                    | undefined
                    | boolean
                    | number
                    | string;

export type Jsx = | Text
                  | Fragment
                  | Intrinsic
                  | Functional;

export type Child = Value | Jsx;

export type Childs = Child[];

export type Children = Child | Child[];

export interface Prototype {
  [TypeId]  : typeof JSX | typeof JSXS;
  [DevId]?  : typeof DevId;
  _tag      : any;
  component?: any;
  props?    : any;
  child?    : Child | undefined;
  childs?   : Child[] | undefined;
}

export interface Text extends Prototype {
  _tag     : typeof TEXT_NODE;
  component: Value;
}

export interface Fragment extends Prototype {
  _tag: typeof FRAGMENT;
}

export interface Intrinsic extends Prototype {
  _tag     : typeof INTRINSIC;
  component: string;
}

export interface Functional extends Prototype {
  _tag     : typeof FUNCTIONAL;
  component: FC.Known;
}

export const isJsx = (u: unknown): u is Jsx => typeof u === 'object' && u !== null && TypeId in u;

export const isText = (u: Jsx): u is Text => u._tag === TEXT_NODE;

export const isFragment = (u: Jsx): u is Fragment => u._tag === FRAGMENT;

export const isIntrinsic = (u: Jsx): u is Intrinsic => u._tag === INTRINSIC;

export const isFunctional = (u: Jsx): u is Functional => u._tag === FUNCTIONAL;

const BasePrototype = proto.declare<Prototype>({
  [TypeId]: JSX,
});

const TextPrototype = proto.declare<Text>({
  ...BasePrototype,
  _tag: TEXT_NODE,
});

const FragmentPrototype = proto.declare<Fragment>({
  ...BasePrototype,
  _tag: FRAGMENT,
});

const IntrinsicPrototype = proto.declare<Intrinsic>({
  ...BasePrototype,
  _tag: INTRINSIC,
});

const FunctionalPrototype = proto.declare<Functional>({
  ...BasePrototype,
  _tag: FUNCTIONAL,
});

export const text = (v: Value): Text =>
  proto.init(TextPrototype, {
    component: v,
  });

export const jsx = (type: any, props: any): Jsx => {
  if (type === Fragment) {
    return proto.init(FragmentPrototype, {
      component: Fragment,
      props    : props,
      child    : props.children,
    });
  }
  switch (typeof type) {
    case 'string': {
      return proto.init(IntrinsicPrototype, {
        component: type,
        props    : props,
        child    : props.children,
      });
    }
    case 'function': {
      return proto.init(FunctionalPrototype, {
        component: FC.register(type),
        props    : props,
      });
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxs = (type: any, props: any): Jsx => {
  if (type === Fragment) {
    return proto.init(FragmentPrototype, {
      [TypeId] : JSXS,
      component: Fragment,
      props    : props,
      childs   : props.children,
    });
  }
  switch (typeof type) {
    case 'string': {
      return proto.init(IntrinsicPrototype, {
        [TypeId] : JSXS,
        component: type,
        props    : props,
        childs   : props.children,
      });
    }
    case 'function': {
      return proto.init(FunctionalPrototype, {
        [TypeId] : JSXS,
        component: FC.register(type),
        props    : props,
      });
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxDEV = (type: any, props: any): Jsx => {
  const self = Array.isArray(props.children)
               ? jsxs(type, props)
               : jsx(type, props);

  self[DevId] = DevId;
  return self;
};

export interface Source extends Prototype {
  id: string;
};

const isSource = (u: unknown): u is Source => isJsx(u) && 'id' in u && typeof u.id === 'string';

const SourcePrototype = proto.declare<Source>({
  id: '',
});

export type SourceInput = | FC.FC
                          | Jsx;

export const makeSource = (input: SourceInput): Source => {
  if (FC.isFC(input)) {
    const self = proto.init(SourcePrototype, jsxDEV(input, {}));
    self.id = FC.name(input);
    return self;
  }
  if (isSource(input)) {
    throw new Error();
  }
  if (!input.props.source) {
    if (!isFunctional(input)) {
      throw new Error();
    }
    const self = proto.init(SourcePrototype, jsxDEV(input.component, structuredClone(input.props)));
    self.id = FC.name(input.component);
    return self;
  }
  if (typeof input.props.source !== 'string') {
    throw new Error();
  }
  const self = proto.init(SourcePrototype, jsxDEV(input.props.source, structuredClone(input.props)));
  self.id = self.props.source;
  return self;
};

export type SourceLookup = | string
                           | FC.FC
                           | Jsx
                           | Source;

export const sourceIdFromLookup = (input: SourceLookup): string => {
  if (typeof input === 'string') {
    return input;
  }
  if (FC.isFC(input)) {
    return FC.name(input);
  }
  if (isSource(input)) {
    return input.id;
  }
  if (typeof input.props.source !== 'string') {
    throw new Error();
  }
  return input.props.source;
};

export const fromSource = (source: Source): Jsx => {
  if (!isSource(source)) {
    throw new Error();
  }
  return jsxDEV(source.component, structuredClone(source.props));
};
