import * as All from '#src/disreact/codec/constants/all.ts';
import * as FC from '#src/disreact/codec/element/function-component.ts';
import * as FiberNode from '#src/disreact/codec/fiber/fiber-node.ts';
import {E} from '#src/internal/pure/effect.ts';
import {isPromise} from 'effect/Predicate';
import * as Children from './children.ts';
import type * as Element from './index.ts';



export const TYPE_OF = 'function';

export const TAG = 'FunctionElement';

export type T = {
  _tag : typeof TAG;
  _name: string;
  meta: {
    idx         : number;
    id          : string;
    step_id     : string;
    full_id     : string;
    isMounted?  : boolean | undefined;
    isModal?    : boolean | undefined;
    isRoot?     : boolean | undefined;
    isMessage?  : boolean | undefined;
    isEphemeral?: boolean | undefined;
  };
  props   : any;
  state   : FiberNode.T;
  render  : FC.FC;
  children: Element.T[];
};

export const is = (type: any): type is T => type._tag === TAG;

export const make = (type: FC.FC, props: any): T => {
  return {
    _tag : TAG,
    _name: FC.resolveName(type),
    meta : {
      idx    : All.Zero,
      id     : All.Empty,
      step_id: All.Empty,
      full_id: All.Empty,
    },
    props,
    state   : FiberNode.make(),
    render  : type,
    children: [],
  };
};

export const makeDEV = make;

export const clone = (self: T): T => {
  const {props, state, render, children, ...rest} = self;

  const cloned    = structuredClone(rest) as T;
  cloned.state    = FiberNode.clone(state);
  cloned.props    = cloneProps(props);
  cloned.render   = render;
  cloned.children = children;
  return cloned;
};

const cloneProps = (props: T['props']): T['props'] => {
  if (!props) {
    return {};
  }

  try {
    return structuredClone(props);
  }
  catch (e) {/**/}

  const acc = {} as any;

  for (const key of Object.keys(props)) {
    const original     = props[key];
    const originalType = typeof original;

    if (originalType === 'object') {
      if (!original) {
        acc[key] = null;
        continue;
      }
      if (original instanceof Array) {
        acc[key] = original.map((item) => cloneProps(item));
        continue;
      }
      acc[key] = cloneProps(original);
      continue;
    }

    acc[key] = original;
  }

  return props;
};

export const cloneDEV = clone;

export const render = (self: T): E.Effect<T['children'], any, any> => E.gen(function* () {
  if (FC.isSync(self.render)) {
    const children = self.render(self.props);
    return Children.normalize(children);
  }

  if (FC.isAsync(self.render)) {
    const output   = self.render(self.props);
    const children = yield* E.tryPromise(async () => await output);
    return Children.normalize(children);
  }

  if (FC.isEffect(self.render)) {
    const children = yield* self.render(self.props);
    return Children.normalize(children);
  }

  const output = self.render(self.props);

  if (isPromise(output)) {
    self.render._tag = FC.ASYNC;
    const children   = yield* E.tryPromise(async () => await output);
    return Children.normalize(children);
  }

  if (E.isEffect(output)) {
    self.render._tag = FC.EFFECT;
    const children   = yield* output;
    return Children.normalize(children);
  }

  self.render._tag = FC.SYNC;
  return Children.normalize(output);
});

export const renderDEV = render;

export const encode = (self: T) => {
  return self.children;
};

export const encodeDEV = encode;
