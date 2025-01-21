import type {Df} from '#src/internal/disreact/virtual/entities/index.ts';
import {Un} from '#src/internal/disreact/virtual/entities/index.ts';


export const useClose = () => {
  Un.resetClose();

  const updater = () => {
    Un.setClose(true);
  };

  return updater;
};


export const useDefer = () => {
  Un.resetDefer();

  const updater = (defer: Df.T) => {
    Un.setDefer(defer);
  };

  return updater;
};
