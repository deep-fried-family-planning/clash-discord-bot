import {AUTHOR_CONFIRM, AUTHOR_EDITING, AUTHOR_FAILURE, AUTHOR_OMNI_BOARD, AUTHOR_SUCCESS, AUTHOR_VIEWING} from '#src/constants/author.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import type {Route} from '#src/discord/store/id-routes.ts';
import type {bool, str, und} from '#src/internal/pure/types-pure.ts';
import type {Embed} from 'dfx/types';



export const unset = undefined;


export const embedIf = (condition: Embed | bool | und, embed?: Embed) => {
  if (condition) {
    return embed;
  }
  return undefined;
};


export const isSystem = (embed?: Embed) => embed?.author?.name === AUTHOR_OMNI_BOARD;
export const asSystem = (embed?: Embed): Embed => {
  return {
    ...embed,
    color : nColor(COLOR.ORIGINAL),
    author: {
      name: AUTHOR_OMNI_BOARD,
    },
  };
};


export const isViewer = (embed?: Embed) => embed?.author?.name === AUTHOR_VIEWING;
export const asViewer = (embed?: Embed): Embed => {
  return {
    ...embed,
    author: {
      name: AUTHOR_VIEWING,
    },
  };
};


export const isEditor = (embed?: Embed) => embed?.author?.name === AUTHOR_EDITING;
export const asEditor = (embed?: Embed): Embed => {
  return {
    ...embed,
    author: {
      name: AUTHOR_EDITING,
    },
  };
};


export const isStatus  = (embed?: Embed) => [AUTHOR_CONFIRM, AUTHOR_SUCCESS, AUTHOR_FAILURE].includes(embed?.author?.name as str);
export const asConfirm = (embed?: Embed): Embed => {
  return {
    ...embed,
    author: {
      name: AUTHOR_CONFIRM,
    },
    color: nColor(COLOR.DEBUG),
  };
};
export const asSuccess = (embed?: Embed): Embed => {
  return {
    ...embed,
    author: {
      name: AUTHOR_SUCCESS,
    },
    color: nColor(COLOR.SUCCESS),
  };
};
export const asFailure = (embed?: Embed): Embed => {
  return {
    ...embed,
    author: {
      name: AUTHOR_FAILURE,
    },
    color: nColor(COLOR.ERROR),
  };
};


export const isClicked = (c: {id: Route}, ax: Ax) =>
  ax.id.predicate === c.id.predicate
  || ax.id.nextPredicate === c.id.predicate
  || ax.id.backPredicate === c.id.predicate;
