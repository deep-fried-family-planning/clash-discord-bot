import {noop} from '#src/disreact/core/primitives/constants.ts';
import * as FC from '#src/disreact/model/runtime/fc.ts';
import * as Hooks from '#src/disreact/model/runtime/hooks.ts';
import * as Jsx from '#src/disreact/model/runtime/jsx.tsx';

export const useInteraction = Hooks.$useInteraction;
export const useState = Hooks.$useState;
export const useReducer = Hooks.$useReducer;
export const useEffect = Hooks.$useEffect;
export const useRef = noop;
export const useMemo = noop;
export const useCallback = noop;
export const useContext = noop;

export const Fragment = Jsx.Fragment;
export const jsx = Jsx.jsx;
export const jsxs = Jsx.jsxs;
export const jsxDEV = Jsx.jsxDEV;
