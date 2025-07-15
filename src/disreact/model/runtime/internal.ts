import type * as Fn from '#disreact/model/core/Fn.ts';
import type * as Polymer from '#disreact/model/Polymer.ts';
import * as Inspectable from 'effect/Inspectable';

export type Internal = never;

export const asyncFnConstructor = (async () => {}).constructor;

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
  toString() {
    if (this.entrypoint) {
      return this.entrypoint;
    }
    return this._id;
  },
} as Fn.FC;

export const makeFC = (fn: (props?: any) => any): Fn.FC => {
  if ('_tag' in fn) {
    return fn as Fn.FC;
  }
  const self = Object.assign(Object.create(FCProto), fn) as Fn.FC;
  self.source = fn.toString();

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
