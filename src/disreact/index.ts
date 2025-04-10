import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';



export const useState   = Dispatcher.impl.useState;
export const useReducer = Dispatcher.impl.useReducer;
export const useEffect  = Dispatcher.impl.useEffect;
export const useIx      = Dispatcher.impl.useIx;
export const usePage    = Dispatcher.impl.usePage;
