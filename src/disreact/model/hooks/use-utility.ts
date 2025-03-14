import {CLOSE} from '#src/disreact/codec/constants/common.ts';
import type {FC} from '#src/disreact/codec/element';
import * as Unsafe from '#src/disreact/model/hooks/unsafe.ts';
import {RootRegistry} from '#src/disreact/model/index.ts';



export const $useMessage = (_: FC.FC[]) => {
  const root = Unsafe.UNSAFE_getRoot();

  return {
    next: (next: FC.FC, props: any = {}) => {
      RootRegistry.UNSAFE_assert(next);

      root.next.id    = next.name;
      root.next.props = props;
    },
    close: () => {
      root.next.id = CLOSE;
    },
  };
};

export const $useIx = () => {
  const root = Unsafe.UNSAFE_getRoot();

  return root.request;
};
