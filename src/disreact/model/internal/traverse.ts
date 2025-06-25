import ArrayQueue from '@rspack/core/dist/util/ArrayQueue';
import {QueueThrottler} from 'clashofclans.js';
import type * as MutableQueue from 'effect/MutableQueue';
import * as MutableList from 'effect/MutableList';
import * as MutableHashSet from 'effect/MutableHashSet';
import * as MutableRef from 'effect/MutableRef';
import type * as Pipeable from 'effect/Pipeable';
import * as Queue from 'effect/Queue';

const TypeId = Symbol.for('disreact/traverse');

export interface Traverse<A> extends Pipeable.Pipeable
{
  [TypeId]     : typeof TypeId;
  queue        : MutableQueue.MutableQueue<A>;
  queueContains: WeakSet;
}
