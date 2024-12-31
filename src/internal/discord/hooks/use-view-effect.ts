import {getParam, setParam} from '#discord/context/controller-params.ts';
import {addEffectHook, hooks} from '#discord/hooks/hooks.ts';
import type {IxIn} from '#discord/types.ts';
import {g} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type UseEffectHook = readonly [str, (ix: IxIn) => AnyE<void>];


export const useViewEffect = <
  T extends AnyE<void>,
>(
  id: str,
  effect: (ix: IxIn) => T,
) => {
  const effect_id = `e_${id}`;

  const exists = getParam(effect_id);

  if (exists === null) {
    setParam(effect_id, 'e');
    addEffectHook([effect_id, effect]);
  }
};


export const updateUseEffect = (ix: IxIn) => g(function * () {
  for (const [effect_id, effect] of hooks.effects) {
    yield * effect(ix);
  }
  hooks.effects = [];
});
