import {DIALOG} from '#discord/constants/constants.ts';
import type {Nv} from '#discord/entities';
import {setNextView, setViewModifier} from '#discord/hooks/hooks.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';


export const useMessageView = () => {
  return (id: Nv.T | und, modifier?: str) => {
    setNextView(id!.name);
    if (modifier) {
      setViewModifier(modifier);
    }
  };
};


export const useDialogView = () => {
  return (id: str) => {
    setNextView(id);
    setViewModifier(DIALOG);
  };
};


export const openView = useMessageView();
