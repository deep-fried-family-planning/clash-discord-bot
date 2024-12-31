import {getParam, setParam} from '#discord/context/controller-params.ts';
import {Cx} from '#discord/entities';
import {hooks} from '#discord/hooks/hooks.ts';
import {Ar, g, Kv, pipe} from '#pure/effect';
import type {alias, Mutable, ne, str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type UseComponentReducerStore = {
  name    : str;
  refs    : alias;
  getState: () => Cx.RefsData;
  setState: (cxs: Cx.RefsData) => void;
  reducers: {
    [k in str]: (state: Cx.RefsData, payload: unknown) => AnyE<Cx.RefsData>
  };
};


export type UseComponentReducerAction = {
  name   : str;
  action : str;
  payload: unknown;
};


export const useComponentReducer = <
  Spec extends {
    [k in str]: Cx.T['_tag']
  },
  Data extends {
    [k in keyof Spec]: Mutable<Extract<Cx.T, {_tag: Spec[k]}>['data']>
  },
  Reducers extends {
    [k in str]: (state: Data, payload: ne) => AnyE<Data>
  },
>(
  config: {
    name   : str;
    spec   : Spec;
    initial: Data;
    actions: Reducers;
  },
) => {
  const refs    = pipe(config.spec, Kv.mapEntries((_, k) => [k, k])) as { [k in keyof Spec]: k };
  const actions = pipe(config.actions, Kv.mapEntries((_, k) => [k, k])) as { [k in keyof Reducers]: k };
  const id      = `cr_${config.name}`;


  const state = {
    initial: config.initial,
    current: undefined as undefined | Data,
  };

  const store = {
    name    : id,
    refs,
    getState: () => {
      const st = state.current ?? state.initial;


      return st;
    },
    setState: (next: Data) => {
      state.current = next;
    },
    reducers: config.actions,
  } as unknown as UseComponentReducerStore;


  const dispatch = <A extends keyof Reducers>(action: A, payload: Parameters<Reducers[A]>[1]) => {
    hooks.actions.push({
      name  : id,
      action: action as str,
      payload,
    });
  };

  return () => {
    const exists = getParam(id);

    if (exists === null) {
      setParam(id, 'cr');
      hooks.reducers.push(store);
      hooks.refs.push(...Kv.toEntries(refs).map(([k]) => k));
    }

    const current = store.getState() as Data;

    return [
      {
        current,
        refs,
        actions,
      },
      dispatch,
    ] as const;
  };
};


export const loadInitialComponentReducerState = (cxv: Cx.Grid) => {
  return hooks.reducers.reduce(
    (acc, store) => {
      const state = store.getState();

      return acc.map((row) => row.map((cx) => {
        if (cx.path.ref in store.refs) {
          return {
            ...cx,
            data: {
              ...cx.data,
              ...state[cx.path.ref],
            },
          } as typeof cx;
        }

        return cx;
      }));
    },
    cxv,
  );
};


export const updateComponentReducer = (store: UseComponentReducerStore, cxs: Cx.Grid) => g(function * () {
  let state = store.getState();

  state = pipe(
    cxs,
    Ar.flatten,
    Ar.filter((cx) => cx.path.ref in store.refs),
    Ar.map((cx) => [cx.path.ref, cx.data] as const),
    Kv.fromEntries,
    Kv.mapEntries((v, k) => [k, {...state[k], ...v}]),
  );

  for (const action of hooks.actions) {
    if (action.name === store.name) {
      state = yield * store.reducers[action.action](state, action.payload);
    }
  }

  store.setState(state);

  return cxs.map((row) => row.map((cx) => {
    if (cx.path.ref in store.refs) {
      return pipe(cx, Cx.set('data', {...cx.data, ...state[cx.path.ref]}));
    }
    return cx;
  })) as Cx.Grid;
});


export const updateAllComponentReducers = (cxs: Cx.Grid) => g(function * () {
  let state: Cx.Grid = cxs;

  for (const store of hooks.reducers) {
    state = yield * updateComponentReducer(store, state);
  }

  return state;
});
