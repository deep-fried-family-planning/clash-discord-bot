import type {str} from '#src/internal/pure/types-pure.ts';
import {Const} from '..';


export const createUseView = (
  views: [str, str, str],
) => () => {
  const openView = (next: str) => {
    views[1] = next;
  };

  const openDialog = (next: str) => {
    views[1] = next;
    views[2] = Const.DIALOG;
  };


  const setViewModifier = (next: str) => {
    views[2] = next;
  };

  return [
    openView,
    openDialog,
    setViewModifier,
  ] as const;
};
