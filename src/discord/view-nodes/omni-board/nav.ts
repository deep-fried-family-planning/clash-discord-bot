import {CLOSE} from '#discord/entities/constants.ts';
import {Button, Row} from '#discord/entities/cxv.ts';
import {setViewModifier} from '#discord/hooks/hooks.ts';
import {openView} from '#discord/hooks/use-view.ts';
import {StyleB} from '#pure/dfx';
import {EMOJI_BACK, EMOJI_CLOSE, EMOJI_NEXT} from '#src/constants/emoji.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


type Props = {
  back?: str;
  next?: str;
};

export const Nav = (props: Props) => {
  return Row(
    props.back && Button({
      emoji  : EMOJI_BACK,
      style  : StyleB.SECONDARY,
      onClick: () => {
        openView(props.back!);
      },
    }),
    props.next && Button({
      emoji  : EMOJI_NEXT,
      style  : StyleB.SECONDARY,
      onClick: () => {
        openView(props.next!);
      },
    }),
    Button({
      emoji  : EMOJI_CLOSE,
      style  : StyleB.SECONDARY,
      onClick: () => {
        setViewModifier(CLOSE);
      },
    }),
  );
};
