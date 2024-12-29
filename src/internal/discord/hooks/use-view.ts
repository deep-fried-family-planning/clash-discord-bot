import {DIALOG} from '#discord/entities/constants.ts';
import {setNextView, setViewModifier} from '#discord/hooks/hooks.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const useMessageView = () => {
  return (id: str, modifier?: str) => {
    setNextView(id);
    if (modifier) {
      setViewModifier(modifier);
    }
  };
};


export const useDialogView = () => {
  return (id: str) => {
    setNextView(id);
    setViewModifier(DIALOG);
  };
};


export const openView = useMessageView();


//
// export const createUseComponent = (
//   params: URLSearchParams,
// ) => {
//   let components = {};
//
//   const set = () => {
//     components = {};
//   };
//
//   return {
//     useComponent: (
//       id: str,
//       initial: str,
//     ) => {
//       const exists = params.get(id);
//
//       if (exists) {
//         return;
//       }
//
//       params.set(id, 'true');
//
//       const thing = () => {
//
//       };
//     },
//   };
// };


//
// export const createUseReducer = (params: URLSearchParams) => {
//   return () => {
//
//   };
// };


// export const createUseDispatch = () => () => {};
//
//
// type Hook = D.TaggedEnum<{
//   State      : {id: HookId};
//   View       : {id: HookId; modifier: str};
//   EmbedDialog: {id: HookId; cxFn: (ex: ExV.T) => Cx.T; exFn: (cx: Cx.T) => ExV.T};
// }>;
// const Hook = D.taggedEnum<Hook>();


// export const createUseSlice = (
//   params: URLSearchParams,
//   slices: str[],
// ) => <
//   T extends ReturnType<typeof Slice.make>,
// >(
//   slice: T,
// ) => {
//   slices.push(slice.name);
//
//   const exists = params.has(slice.name);
//
//   if (exists) {
//     return;
//   }
// };


// export const createUseEffect = (
//   params: URLSearchParams,
//   effects: [str, () => void][],
// ) => <
//   T extends | (() => void),
// >(
//   id: str,
//   effect: T,
// ) => {
//   const exists = params.has(id);
//
//   if (exists) {
//     return;
//   }
//
//   effects.push([id, effect]);
//
//   params.set(id, 'true');
// };
