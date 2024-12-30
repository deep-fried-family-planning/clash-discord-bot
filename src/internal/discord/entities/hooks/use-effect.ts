import {getParam, setParam} from '#discord/context/controller-params.ts';
import {addEffectHook, hooks} from '#discord/entities/hooks/hooks.ts';
import {type E, g} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type UseEffectHook = readonly [str, E.Effect<any, any, any>];


export const useEffect = <
  T extends E.Effect<any, any, any>,
>(
  id: str,
  effect: T,
) => {
  const effect_id = `e_${id}`;

  const exists = getParam(effect_id);

  if (exists === null) {
    setParam(effect_id, 'e');
    addEffectHook([effect_id, effect]);
  }
};


export const updateUseEffect = g(function * () {
  for (const [effect_id, effect] of hooks.effects) {
    yield * effect;
  }
  hooks.effects = [];
});
