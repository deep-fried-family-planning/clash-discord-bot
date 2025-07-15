import {ASYNC_CONSTRUCTOR} from '#disreact/core/constants.ts';
import type * as Fn from '#disreact/model/entity/Fn.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Inspectable from 'effect/Inspectable';

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

const makeFC = (type: Jsx.FC): Fn.FC => {
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

export const JsxSymbol = Symbol('disreact/Jsx');

export const FragmentSymbol = Symbol('disreact/Fragment');

const JsxProto: Jsx.Jsx = {
  [JsxSymbol]: JsxSymbol,
  jsx        : true,
  entrypoint : undefined,
  key        : undefined,
  type       : FragmentSymbol,
  props      : undefined,
  ref        : undefined,
  child      : undefined,
  childs     : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    const props = {...this.props};
    delete props.children;

    return {
      _id       : 'Jsx',
      entrypoint: this.entrypoint,
      key       : this.key,
      type      : this.type === FragmentSymbol ? 'Fragment' : this.type,
      props     : props,
      children  : this.child ?? this.childs,
    };
  },
};

export const makeJsx = (type: Jsx.Type, setup: Jsx.Setup, key?: Jsx.Key): Jsx.Jsx => {
  const self = Object.create(JsxProto) as Jsx.Jsx;
  (self.entrypoint as any) = setup.entrypoint;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? makeFC(type) : type;
  (self.props as any) = setup;
  return self;
};
