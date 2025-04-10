import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Data, MergeState, MergeStrategy} from 'effect';
import { Option} from 'effect';
import {absurd, Either} from 'effect';
import {Differ} from 'effect';

export * as Lifecycle from './lifecycle.ts';
export type Lifecycle = never;

export const renderTask = () => {};

export const renderEffect = () => {};

export const mount = () => {};

export const dismount = () => {};

export const handleEvent = () => {};
