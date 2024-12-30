import type {Driver} from '#discord/context/model-driver.ts';
import type {Nx} from '#discord/entities/basic';
import {Cx, type Ex, type Nv} from '#discord/entities/basic';
import {getNextView} from '#discord/entities/hooks/hooks.ts';
import type {IxIn} from '#discord/types.ts';


export type SimulationContext = {
  driver                : Driver;
  action                : Cx.Path;
  ix                    : IxIn;
  rx_embeds             : Ex.Grid;
  rx_components         : Cx.Grid;
  view_original         : Nv.T;
  view_original_mount   : Nx.T;
  view_original_rendered: Nx.T;
  view_next             : Nv.T;
  view_next_rendered    : Nx.T;
};
export type T = SimulationContext;


export const empty = (): SimulationContext => ({
  driver       : {} as Driver,
  action       : Cx.Path.empty(),
  ix           : {} as IxIn,
  rx_embeds    : [],
  rx_components: [],
  view_original: {} as Nv.T,
  view_next    : {} as Nv.T,
});


export const addDriver = (driver: Driver) => (ctx: T) => {
  ctx.driver = driver;
  return ctx;
};


export const addIx = (ix: IxIn) => (ctx: T) => {
  ctx.ix = ix;
  return ctx;
};


export const resolveAction = () => (ctx: T) => {
  ctx.action = Cx.Path.parse(ctx.ix.data.custom_id);
  return ctx;
};


export const resolveView = () => (ctx: T) => {
  ctx.view_original = ctx.driver.views[ctx.action.view];
  return ctx;
};


export const resolveNextView = () => (ctx: T) => {
  const nextView = getNextView();
  ctx.view_next  = ctx.driver.views[nextView];
  return ctx;
};
