import {CLOSE} from '#discord/constants/constants.ts';
import type {Nv} from '#discord/entities';
import {Cv} from '#discord/entities';
import {setViewModifier} from '#discord/hooks/hooks.ts';
import {openView} from '#discord/hooks/use-view.ts';
import {StyleB} from '#pure/dfx';
import {EMOJI_BACK, EMOJI_CLOSE, EMOJI_NEXT} from '#src/constants/emoji.ts';


type Props = {
  first? : Cv.T;
  second?: Cv.T;
  back?  : Nv.T;
  next?  : Nv.T;
};


export const NavButtons = (props: Props) => {
  return Cv.Row(
    props.first,
    props.second,
    props.back && Cv.Button({
      emoji  : EMOJI_BACK,
      style  : StyleB.SECONDARY,
      onClick: () => {
        openView(props.back);
      },
    }),
    props.next && Cv.Button({
      emoji  : EMOJI_NEXT,
      style  : StyleB.SECONDARY,
      onClick: () => {
        openView(props.next);
      },
    }),
    Cv.Button({
      emoji  : EMOJI_CLOSE,
      style  : StyleB.SECONDARY,
      onClick: () => {
        setViewModifier(CLOSE);
      },
    }),
  );
};
