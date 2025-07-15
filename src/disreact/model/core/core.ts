import type * as Elem from '#disreact/model/entity/Elem.ts';
import type * as Fn from '#disreact/model/core/Fn.ts';
import type * as Polymer from '#disreact/model/core/Polymer.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

export type Core = never;

export const asyncFnConstructor = (async () => {}).constructor;

const FunctionComponentPrototype: Fn.JsxFC = {
  _tag       : undefined,
  _id        : '',
  _state     : true,
  _props     : true,
  entrypoint : undefined,
  displayName: '',
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id        : 'FunctionComponent',
      _tag       : this._tag,
      name       : this._id,
      entrypoint : this.entrypoint,
      displayName: this.displayName,
      props      : this._props,
      state      : this._state,
    });
  },
} as Fn.JsxFC;

export const makeFunctionComponent = (fn: (props?: any) => any): Fn.JsxFC => {
  if ('_tag' in fn) {
    return fn as Fn.JsxFC;
  }
  const self = Object.assign(fn, FunctionComponentPrototype) as Fn.JsxFC;

  if (fn.length === 0) {
    self._props = false;
  }
  if (fn.constructor === asyncFnConstructor) {
    self._tag = 'Async';
  }
  return self;
};

const PropsPrototype: Elem.Props = {
  onclick : undefined,
  onselect: undefined,
  onsubmit: undefined,
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol]() {
    throw new Error();
  },
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Props',
      value: this,
    });
  },
} as Elem.Props;

export const makeProps = (props: any): Elem.Props => {
  return Object.assign(
    Object.create(PropsPrototype),
    props,
  );
};

export const makeRestProps = (props: any): Elem.Props => {
  return props;
};

const ElementPrototype: Elem.Elem = {
  _tag     : 'Intrinsic',
  _env     : undefined as any,
  component: undefined,
  key      : undefined,
  text     : undefined,
  ancestor : undefined,
  children : undefined,
  rendered : undefined,
  depth    : 0,
  index    : 0,
  height   : 0,
  valence  : 0,
  trie     : '',
  step     : '',
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol]() {
    throw new Error();
  },
  toJSON() {
    return Inspectable.format({
      _id     : 'Element',
      _tag    : this._tag,
      key     : this.key,
      props   : this.props,
      polymer : this.polymer,
      children: this.children,
    });
  },
};

export const makeTextElement = (text: any): Elem.Elem => {
  const self = Object.create(ElementPrototype) as Elem.Elem;
  self._tag = 'Text';
  self.text = text;
  return self;
};

export const makeElement = (jsx: Jsx.Jsx): Elem.Elem => {
  const self = Object.create(ElementPrototype) as Elem.Elem;
  self.key = jsx.key;
  self.component = jsx.type as any;
  self.props = makeProps(jsx.props);
  switch (typeof self.component) {
    case 'string': {
      return self;
    }
    case 'function': {
      self._tag = 'Component';
      return self;
    }
  }
  self._tag = 'Fragment';
  return self;
};
