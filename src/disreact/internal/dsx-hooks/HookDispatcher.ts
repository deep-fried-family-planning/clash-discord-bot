import {E} from '#src/internal/pure/effect.ts';



export type HookDispatch = {
  useState : <T>(initialValue: T) => [T, ((value: T) => void) | ((updater: (curr: T) => T) => void)];
  useEffect: (effect: () => void) => void;
};


const syncDispatcher = {current: null as HookDispatch | null};


const make = E.gen(function * () {
  return {

  };
});


export class HookDispatcher extends E.Tag('DisReact.HookDispatcher')<
  HookDispatcher,
  HookDispatch
>() {
  static __setSync = (dispatcher: HookDispatch) => syncDispatcher.current = dispatcher;
}


const test = E.gen(function * () {
  const dispatcher = HookDispatcher.useEffect();
});
