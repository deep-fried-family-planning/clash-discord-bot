import * as All from '#src/disreact/codec/constants/all.ts';
import * as FC from '#src/disreact/codec/element/function-component.ts';
import type * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';
import type * as TextElement from '#src/disreact/codec/element/text-element.ts';
import * as FiberNode from '#src/disreact/codec/entities/fiber-node.ts';
import {E} from '#src/internal/pure/effect.ts';
import {isPromise} from 'effect/Predicate';
import * as Children from './children.ts';



export const TAG = 'FunctionElement';

export type FunctionElement = {
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
  state   : FiberNode.FiberNode;
  render  : FC.FC;
  children: (
    | FunctionElement
    | IntrinsicElement.IntrinsicElement
    | TextElement.TextElement
    )[];
};

export const is = (type: any): type is FunctionElement => type._tag === TAG;

export const make = (type: FC.FC, props: any): FunctionElement => {
  return {
    _tag    : TAG,
    _name   : FC.resolveName(type),
    meta    : getMeta(type),
    props,
    state   : FiberNode.make(),
    render  : type,
    children: [],
  };
};

export const makeDEV = make;

export const render = (self: FunctionElement): E.Effect<FunctionElement['children'], any, any> => E.gen(function* () {
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


const getMeta = (type: FC.FC): FunctionElement['meta'] => {
  return {
    idx    : All.Zero,
    id     : All.Empty,
    step_id: All.Empty,
    full_id: All.Empty,
  };
};
