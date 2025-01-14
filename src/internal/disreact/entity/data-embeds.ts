import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Ed, Route} from '#src/internal/disreact/entity/index.ts';
import type {mut, opt, str} from '#src/internal/pure/types-pure.ts';


export type Grid = Ed.T[];
export type Rec = Map<str, Ed.T>;


export type T = {
  controller?: Ed.Controller;
  grid       : Grid;
  refs       : Rec;
};


export const make = (grid: Grid): T => {
  const refs = new Map() as Rec;

  for (const embed of grid) {
    if (Route.isEmbed(embed.route) && embed.route.params.ref !== NONE) refs.set(embed.route.params.ref, embed);
    if (Ed.isDialogLinked(embed)) for (const ref of embed.refs) refs.set(ref, embed);
  }

  const controller = grid[0];

  if (Ed.isController(controller)) return {
    controller,
    grid,
    refs,
  };

  return {
    grid,
    refs,
  };
};


export const updateControllerRoute = (route: Route.T) => (ex: T) => {
  if (ex.controller) {
    (ex.controller as mut<Ed.Controller>).route = route;
  }
  return ex;
};


export const updateDataByRef = (ref: str, data: opt<Ed.Data>) => (ex: T) => {
  const target = ex.refs.get(ref);

  if (target) {
    for (const [key, value] of Object.entries(data)) {
      target.data[key as keyof typeof target.data] = value as never;
    }
  }

  return ex;
};


export const encode = (ex: T) => ex.grid.map(Ed.encode);
