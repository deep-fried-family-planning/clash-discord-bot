import type * as Fn from '#disreact/model/core/Fn.ts';
import type * as Polymer from '#disreact/model/core/Polymer.ts';
import * as Inspectable from 'effect/Inspectable';

export type Internal = never;

export const asyncFnConstructor = (async () => {}).constructor;

const FCProto: Fn.JsxFC = {
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
      entrypoint : this.entrypoint,
      name       : this._id,
      displayName: this.displayName,
      props      : this._props,
      state      : this._state,
    });
  },
} as Fn.JsxFC;

export const makeFC = (fn: (props?: any) => any): Fn.JsxFC => {
  if ('_tag' in fn) {
    return fn as Fn.JsxFC;
  }
  const self = Object.assign(Object.create(FCProto), fn) as Fn.JsxFC;

  if (fn.constructor === asyncFnConstructor) {
    self._tag = 'Async';
  }
  if (fn.length === 0) {
    self._props = false;
  }
  if (self.displayName) {
    self._id = self.displayName;
  }
  else if (self.name) {
    self._id = self.name;
  }
  return self;
};

const MonomerProto: Polymer.Monomer = {} as Polymer.Monomer;
