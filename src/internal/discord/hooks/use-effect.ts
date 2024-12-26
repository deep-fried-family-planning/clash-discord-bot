import type {str} from '#src/internal/pure/types-pure.ts';


export const createUseEffect = (
  effects: (() => void)[],
  params: URLSearchParams,
) => <
  T extends | (() => void),
>(
  id: str,
  effect: T,
) => {
  const exists = params.has(id);

  if (exists) {
    return;
  }

  effects.push(effect);

  params.set(id, 'true');
};
