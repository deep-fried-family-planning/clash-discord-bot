import {DIALOG} from '#discord/entities/constants/constants.ts';
import {setNextView, setViewModifier} from '#discord/hooks/hooks.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const useMessageView = () => {
  return (id: str, modifier?: str) => {
    setNextView(id);
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
