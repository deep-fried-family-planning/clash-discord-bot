import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';



export const _createContextReducer = (
  id: string,
  initialState: any,
  reducer: any,
) => {
  return () => {
    const ctx = HookDispatch.__ctxread();

    if (!ctx.store) {
      ctx.store = {
        id,
        initialState,
        reducer,
        stack: [{...initialState}],
        queue: [],
      };
    }

    if (ctx.store.id !== id) {
      throw new Error('Cannot use multiple context stores in a single root tree.');
    }

    const dispatch = (action: any) => {
      if (!ctx.store) {
        throw new Error('Cannot use context store outside of a component.');
      }
      if (ctx.store.id !== id) {
        throw new Error('Cannot use multiple context stores in a single root tree.');
      }
      ctx.store.queue.push(action);
    };

    return [
      ctx.store.stack.at(-1)!,
      dispatch,
    ];
  };
};
