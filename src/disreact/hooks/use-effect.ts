import type {Hooks} from '#src/disreact/dsx/types.ts';



export const _useEffect = (fiber: Hooks) => (effect: any, deps?: any[]) => {
  const current = fiber.stack[fiber.pc];

  if (deps) {
    for (const dep of deps) {
      switch (typeof dep) {
        case 'symbol':
        case 'function':
          throw new Error('Unsupported Dependency Type');
      }
    }
  }

  if (!current) {
    fiber.stack[fiber.pc] = deps ? {d: deps} : {};
  }

  const state = fiber.stack[fiber.pc];

  if (fiber.rc === 0) {
    fiber.async.push(effect);
  }
  else if (deps) {
    if (state.d.length === 0 && deps.length === 0) {
      fiber.async.push(effect);
    }
    else if (state.d?.length !== deps.length) {
      throw new Error('Laws of Hooks Violation');
    }
    else {
      let changed = false;
      for (let i = 0; i < deps.length; i++) {
        if (deps[i] !== state.d[i]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        fiber.async.push(effect);
        state.d = deps;
      }
    }
  }

  fiber.pc++;
};
