import * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import * as Jsx from '#src/disreact/model/util/jsx-default.ts';

export const __jsxDEV = {
  primitive    : Jsx.primitive,
  normalization: Jsx.normalization,
  encoding     : Jsx.encoding,
};

export const __mutex = E.unsafeMakeSemaphore(1);

export const __hook = {

};
