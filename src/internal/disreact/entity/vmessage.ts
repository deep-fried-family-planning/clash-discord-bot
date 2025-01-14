import type {RestMessage} from '#pure/dfx';
import {g, pipe} from '#pure/effect';
import type {Route} from '#src/internal/disreact/entity/index.ts';
import {Cd, Ed, Ix, Tx} from '#src/internal/disreact/entity/index.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';
import type {bool, num, str} from '#src/internal/pure/types-pure.ts';


type Em = Ed.T;
type Cm = Cd.T;


export type T = {
  _tag      : 'Message';
  root_id?  : str;
  node_id?  : str;
  isEmpty?  : bool;
  embeds    : Ed.T[];
  components: Cd.T[][];
  defer     : Tx.Defer;
};


export const makeEmpty = (): T => ({
  _tag      : 'Message',
  isEmpty   : true,
  embeds    : [],
  components: [],
  defer     : Tx.None,
});


export const make = (
  embeds: Ed.T[],
  components: Cd.T[][],
  defer: Tx.Defer = Tx.None,
): T => ({
  _tag: 'Message',
  embeds,
  components,
  defer,
});


export const makeFromRest = g(function * () {
  const rest = yield * RouteManager.rest();

  if (Ix.isRestComponent(rest, rest.data)) {
    return make(
      Ed.decodeGrid(rest.message?.embeds),
      Cd.decodeGrid(rest.message?.components),
    );
  }

  return makeEmpty();
});


export const encodeForRestOrMemory = (route: Route.T) => (message: T) => {
  const [controller, ...embeds] = message.embeds;

  const routedController = pipe(
    controller,
    Ed.setRoute(route),
  );

  const encodedController = Ed.encode(routedController, 0);
  const encodedEmbeds = embeds.map((embed, row) => Ed.encode(embed, row + 1));

  return {
    embeds    : [encodedController, ...encodedEmbeds],
    components: Cd.encodeGrid(message.components),
  } as RestMessage;
};


export const identity = (message: unknown) => message as T;


export const setEmbeds = (embeds: Em[]) => (message: T): T => {
  message.embeds = embeds;
  return message;
};


export const getEmbeds = (message: T): Em[] => message.embeds;


export const mapEmbeds = (fn: (embed: Em) => Em) => (message: T): T => {
  message.embeds = message.embeds.map(fn);
  return message;
};


export const updateEmbedAt = (row: num, updater: (target: Em) => Em) => (message: T): T => {
  const target        = message.embeds[row];
  message.embeds[row] = updater(target);
  return message;
};


export const getComponents = (message: T): Cm[][] => message.components;


export const setComponents = (components: Cm[][]) => (message: T): T => {
  message.components = components;
  return message;
};


export const mapComponents = (fn: (component: Cm) => Cm) => (message: T): T => {
  message.components = message.components.map((row) => row.map(fn));
  return message;
};


export const updateComponentAt = (row: num, column: num, updater: (target: Cm) => Cm) => (message: T): T => {
  const target                    = message.components[row][column];
  message.components[row][column] = updater(target);
  return message;
};
