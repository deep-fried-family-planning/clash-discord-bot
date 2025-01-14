import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Auth, Cd, Route} from '#src/internal/disreact/entity/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type Grid = Cd.T[][];
export type Rec = Map<str, Cd.T>;


export type T = {
  custom_ids: Rec;
  grid      : Grid;
  refs      : Rec;
};


export const make = (grid: Grid): T => {
  const custom_ids = new Map() as Rec;
  const refs       = new Map() as Rec;

  for (const row of grid) {
    for (const component of row) {
      if (component.data.custom_id) custom_ids.set(component.data.custom_id, component);
      if ((Route.isComponent(component.route) || Route.isDirect(component.route)) && component.route.params.ref !== NONE) refs.set(component.route.params.ref, component);
    }
  }

  return {
    grid,
    custom_ids,
    refs,
  };
};


export const updateDataByRef = () => () => {};


export const updateFromRest = (custom_id: str, values: str[]) => () => {};


export const withAuth = (auths: Auth.T[]) => (cx: T) => {
  const grid = cx.grid.map((row) => row.filter(
    (cd) => !cd.auths || !cd.auths.length || Auth.hasAllAuths(auths, cd.auths),
    ),
  ).filter((row) => row.length);

  return make(grid);
};


export const encode = (cx: T) => Cd.encodeGrid(cx.grid);
