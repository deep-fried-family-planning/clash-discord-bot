import {StyleB} from '#pure/dfx';
import {EMOJI_BACK, EMOJI_CLOSE, EMOJI_NEXT} from '#src/constants/emoji.ts';
import {setViewModifier} from '#src/internal/disreact/constants/hooks/hooks.ts';
import {openView} from '#src/internal/disreact/constants/hooks/use-view.ts';
import {CLOSE} from '#src/internal/disreact/entity/constants.ts';
import type {Nview} from 'src/internal/disreact/entity';
import {Cv} from 'src/internal/disreact/entity';


type Props = {
  first? : Cv.T;
  second?: Cv.T;
  back?  : Nview.T;
  next?  : Nview.T;
};


export const NavButtons = (props: Props) => {
  return Cv.Row(
    props.first,
    props.second,
    props.back && Cv._Button({
      emoji  : EMOJI_BACK,
      style  : StyleB.SECONDARY,
      onClick: () => {
        openView(props.back);
      },
    }),
    props.next && Cv._Button({
      emoji  : EMOJI_NEXT,
      style  : StyleB.SECONDARY,
      onClick: () => {
        openView(props.next);
      },
    }),
    Cv._Button({
      emoji  : EMOJI_CLOSE,
      style  : StyleB.SECONDARY,
      onClick: () => {
        setViewModifier(CLOSE);
      },
    }),
  );
};
