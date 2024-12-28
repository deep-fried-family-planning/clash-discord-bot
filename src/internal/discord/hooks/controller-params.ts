import {CxPath} from '#discord/routing/cx-path.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


let paramsV2 = new URLSearchParams(),
    routeV2  = CxPath.empty();


export const setAllParams   = (next: URLSearchParams) => {paramsV2 = next};
export const getAllParams   = () => paramsV2;
export const clearAllParams = () => {paramsV2 = new URLSearchParams()};
export const setParam       = (k: str, v: str) => {paramsV2.set(k, v)};
export const getParam       = (k: str) => {return paramsV2.get(k)};


export const setRoute   = (next: CxPath) => {routeV2 = next};
export const clearRoute = () => {routeV2 = CxPath.empty()};
export const getRoute   = () => ({...routeV2});
export const setPath    = (next: Partial<CxPath>) => {routeV2 = {...routeV2, ...next}};


export {paramsV2, routeV2};
