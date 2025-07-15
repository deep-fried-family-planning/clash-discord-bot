import {ASYNC_CONSTRUCTOR} from '#disreact/core/constants.ts';
import type * as Fn from '#disreact/model/entity/Fn.ts';
import type * as JsxRuntime from '#disreact/model/runtime/JsxRuntime.tsx';
import * as Inspectable from 'effect/Inspectable';

export const symbol = Symbol('disreact/Jsx');

export const fragment = Symbol('disreact/Fragment');

const Proto: JsxRuntime.Jsx = {
  [symbol]  : symbol,
  jsx       : true,
  entrypoint: undefined,
  key       : undefined,
  type      : fragment,
  props     : undefined,
  ref       : undefined,
  child     : undefined,
  childs    : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    const props = {...this.props};
    delete props.children;

    return {
      _id       : 'Jsx',
      entrypoint: this.entrypoint,
      key       : this.key,
      type      : this.type === fragment ? 'Fragment' : this.type,
      props     : props,
      children  : this.child ?? this.childs,
    };
  },
};

export const makeJsx = (type: JsxRuntime.Type, setup: JsxRuntime.Setup, key?: JsxRuntime.Key): JsxRuntime.Jsx => {
  const self = Object.create(Proto) as JsxRuntime.Jsx;
  (self.entrypoint as any) = setup.entrypoint;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? makeFC(type) : type;
  (self.props as any) = setup;
  return self;
};

const FCProto: Fn.FC = {
  _tag       : undefined,
  _id        : undefined as any,
  _state     : true,
  _props     : true,
  entrypoint : undefined,
  displayName: undefined as any,
  source     : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id        : 'FunctionComponent',
      _tag       : this._tag,
      entrypoint : this.entrypoint,
      name       : this._id,
      displayName: this.displayName,
      props      : this._props,
      state      : this._state,
    };
  },
} as Fn.FC;

const makeFC = (type: JsxRuntime.FC): Fn.FC => {
  if ('_tag' in type) {
    return type as Fn.FC;
  }
  const source = type.toString();
  const props = type.length !== 0;
  const isAsync = type.constructor === ASYNC_CONSTRUCTOR;

  const self = Object.assign(Object.create(FCProto), type) as Fn.FC;

  if (isAsync) {
    self._tag = 'Async';
  }
  self._id = self.displayName ? self.displayName :
             self.name ? self.name :
             'Anonymous';

  self._props = props;
  self.source = source;

  return self;
};
