import type {TAuth} from '#src/disreact/api/auth.ts';
import {__DISREACT_NONE} from '#src/disreact/api/constants.ts';
import {Auth, Rest, Routes} from '#src/disreact/api/index.ts';
import {findRestTarget} from '#src/disreact/api/rest.ts';
import {decodeHooks, type HookStates} from '#src/disreact/model/hooks/hook-state.ts';
import {CriticalFailure} from '#src/disreact/enum/errors.ts';
import {E, L} from '#src/internal/pure/effect.ts';



export type CurrentContext = ReturnType<typeof makeCurrent>;
type C = CurrentContext;

export type CurrentContextKey = keyof CurrentContext;
type K = CurrentContextKey;


const makeCurrent = () => ({
  auths : null as unknown as TAuth[],
  route : null as unknown as Routes.Main,
  states: null as unknown as HookStates,
  event : {
    type  : null as unknown as 'onClick' | 'onSubmit',
    target: null as unknown as {},
    values: null as unknown as string[],
  },
});



const decodeInteraction = (rest: Rest.Interaction) => E.gen(function * () {
  switch (rest.type) {
    case Rest.InteractionType.PING:
    case Rest.InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
    case Rest.InteractionType.APPLICATION_COMMAND:
      return yield * new CriticalFailure();
  }

  // submission
  if (rest.type === Rest.InteractionType.MODAL_SUBMIT) {
    if (!('data' in rest)) return yield * new CriticalFailure();
    if (!('custom_id' in rest.data)) return yield * new CriticalFailure();

    const route = yield * Routes.decodePath(rest.data.custom_id);

    return {
      auths : Auth.decodeAuths(rest),
      route : route,
      states: {},
      event : {
        type  : 'onSubmit',
        target: {},
        values: rest.data.components.map((row) => {
          if (!('components' in row)) return __DISREACT_NONE;
          const text = row.components[0];
          if (!('value' in text)) return __DISREACT_NONE;
          return text.value;
        }),
      },
    } satisfies CurrentContext;
  }

  // component click
  if (!('message' in rest)) return yield * new CriticalFailure();
  if (!('embeds' in rest.message)) return yield * new CriticalFailure();
  if (!('image' in rest.message.embeds[0])) return yield * new CriticalFailure();
  if (!('url' in rest.message.embeds[0].image)) return yield * new CriticalFailure();

  const route = yield * Routes.decodeUrl(rest.message.embeds[0].image.url);
  const target = findRestTarget(rest.data.custom_id, rest.message.components);

  if (!target) return yield * new CriticalFailure();

  return {
    auths : Auth.decodeAuths(rest),
    route : route.params,
    states: decodeHooks(route.search),
    event : {
      type  : 'onClick',
      target,
      values: rest.data.values as unknown as string[],
    },
  } satisfies CurrentContext;
});


const context = E.gen(function * () {
  let current = makeCurrent();

  return {
    allocate: (rest: Rest.Interaction) => E.gen(function * () {
      current       = makeCurrent();
      current.auths = Auth.decodeAuths(rest);
      current       = yield * decodeInteraction(rest);
      return current;
    }),
    getKey: <A extends K>(key: A) => current[key],
    setKey: <A extends K>(key: A, value: C[A]) => {
      current[key] = value;
    },
    mapKey: <A extends K>(key: A, f: (value: C[A]) => C[A]) => current[key] = f(current[key]),
    getAll: () => current,
  };
});


export class ContextManager extends E.Tag('DisReact.FiberContext')<
  ContextManager,
  E.Effect.Success<typeof context>
>() {
  static Type      = null as unknown as CurrentContext;
  static Key       = null as unknown as CurrentContextKey;
  static makeLayer = () => L.effect(this, context);
}
