import type {Schema} from 'effect/Schema';
import {Undefined} from 'effect/Schema';



export const T = Undefined;

export type T = Schema.Type<typeof T>;

export const is = (type: any): type is T => type === undefined;

export const make = (type: any, props: any): T => undefined;
