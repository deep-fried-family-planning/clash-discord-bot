import type * as Lifecycle from '#src/disreact/model/lifecycle/lifecycle.ts';
import type * as Const from '#src/disreact/model/util/const.ts';
import type {MutableList} from 'effect';

export type LifecycleStack = {
  original: Const.LifecycleType;
  list    : MutableList.MutableList<Lifecycle.Lifecycle>;
};
