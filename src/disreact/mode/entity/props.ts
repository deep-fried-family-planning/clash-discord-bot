import * as Keys from '#src/disreact/codec/intrinsic/keys.ts';
import type {Elem} from '#src/disreact/mode/entity/elem.ts';
import type * as Event from '#src/disreact/mode/entity/event.ts';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import console from 'node:console';

export declare namespace Props {
  export type Props = Record<string, any>;
  export type NoChild = Props & {children?: never};
  export type AndChild = Props & {children: Elem.Any};
  export type AndChildren = Props & {children: Elem.Any[]};
}
export type Props = Props.Props;

const HANDLER_KEYS = [
  Keys.onclick,
  Keys.onselect,
  Keys.onsubmit,
];

const RESERVED = [
  ...HANDLER_KEYS,
  Keys.children,
  Keys.handler,
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

export const make = (p: any): Props.Props => {
  if (!p) return p;
  if (typeof p !== 'object') return p;
  if (Equal.symbol in p) return p;
  if (Array.isArray(p)) {
    const acc = [] as any[];
    for (const item of p) acc.push(make(item));
    return Data.array(acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(p)) acc[key] = make(p[key]);
  return Data.struct(acc);
};

export const extractHandler = (props: any): Event.Handler | undefined => {
  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const key = HANDLER_KEYS[i];
    const handler = props[key];

    if (handler) {
      delete props[key];
      return handler;
    }
  }
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
