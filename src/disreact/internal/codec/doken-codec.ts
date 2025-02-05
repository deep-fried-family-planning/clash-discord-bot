import type {DecodedRoute} from '#src/disreact/internal/codec/route-codec.ts';
import {DokenMemory} from '#src/disreact/implementation/DokenMemory-dynamo.ts';
import {E} from '#src/internal/pure/effect.ts';



export const encodeDoken = () => {};


export const decodeCommandDoken = () => {};


export const decodeMessageDoken = (route: DecodedRoute) => {

};


export const decodeDialogDoken = (route: DecodedRoute) => E.gen(function * () {
  yield * E.fork(DokenMemory.lookup(route.params.id));
});
