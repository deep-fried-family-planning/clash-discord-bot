import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts'



export const useState   = HooksDispatcher.impl.useState
export const useReducer = HooksDispatcher.impl.useReducer
export const useEffect  = HooksDispatcher.impl.useEffect
export const useIx      = HooksDispatcher.impl.useIx
export const usePage    = HooksDispatcher.impl.usePage
