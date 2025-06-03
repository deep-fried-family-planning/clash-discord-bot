import type * as El from '#src/disreact/model/entity/el.ts';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Array from 'effect/Array';

export const TypeId = Symbol.for('disreact/props');

export declare namespace Props {
  export type Props = Record<string, any>;
  export type NoChild = Props & {children?: never};
  export type AndChild = Props & {children: El.El};
  export type AndChildren = Props & {children: El.El[]};
}
export type Props = Props.Props;

const HANDLER_KEYS = [
  'onclick',
  'onselect',
  'onsubmit',
];

const RESERVED = [
  ...HANDLER_KEYS,
  'children',
  'handler',
];

export const cloneKnownProps = (props: Props): Props => {
  const reserved = {} as any;

  for (const key of RESERVED) {
    const prop = props[key];
    if (prop) {
      reserved[key] = prop;
      delete props[key];
    }
  }

  const cloned = structuredClone(props);

  for (const key of Object.keys(reserved)) {
    cloned[key] = reserved[key];
  }

  return cloned;
};

export const isProps = (p: any): p is Props =>
  !!p
  && typeof p === 'object'
  && !Array.isArray(p)
  && Equal.symbol in p;

export const make = (p: any): Props.Props => {
  if (
    !p
    || typeof p !== 'object'
    || Equal.symbol in p
  ) {
    return p;
  }
  if (Array.isArray(p)) {
    const acc = [] as any[];
    for (const item of p) {
      acc.push(make(item));
    }
    return Data.array(acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(p)) {
    acc[key] = make(p[key]);
  }
  return Data.struct(acc);
};

export const extractHandler = (props: any): El.Handler | undefined => {
  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const key = HANDLER_KEYS[i];
    const handler = props[key];

    if (handler) {
      delete props[key];
      return handler;
    }
  }
};

export const extractKey = (props: any) => {
  if (props.key) {
    const key = props.key;
    delete props.key;
    return key;
  }
};

export const extractChildren = (props: any) => {

};

// export class Props implements Equal.Equal {
//   readonly p: Props.Props;
//   constructor(props: any = {}) {
//     this.p = make(props);
//   }
//   [Equal.symbol](that: Equal.Equal): boolean {
//     if (!(that instanceof Props)) {
//       return false;
//     }
//     return Equal.equals(this.p, that.p);
//   }
//   [Hash.symbol](): number {
//     return Hash.hash(this.p);
//   }
// }
