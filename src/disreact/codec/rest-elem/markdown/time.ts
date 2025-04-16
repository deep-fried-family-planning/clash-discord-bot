import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {BI, S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as Time from '#src/disreact/codec/rest-elem/markdown/time.ts';
export type Time = typeof Time;

export const TAG  = 'time',
             NORM = TAG;

export const Children = S.Never;

export const Attributes = S.Union(
  declareProps(S.Struct({d: S.Union(S.String, S.Int, S.BigInt)})),
  declareProps(S.Struct({D: S.Union(S.String, S.Int, S.BigInt)})),
  declareProps(S.Struct({t: S.Union(S.String, S.Int, S.BigInt)})),
  declareProps(S.Struct({T: S.Union(S.String, S.Int, S.BigInt)})),
  declareProps(S.Struct({f: S.Union(S.String, S.Int, S.BigInt)})),
  declareProps(S.Struct({F: S.Union(S.String, S.Int, S.BigInt)})),
  declareProps(S.Struct({R: S.Union(S.String, S.Int, S.BigInt)})),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  const {d, D, t, T, f, F, R} = self.props;

  const input =
          d ??
          D ??
          t ??
          T ??
          f ??
          F ??
          R;

  const maybeNow = input === 'now'
    ? Date.now()
    : input;

  const time = typeof maybeNow === 'bigint'
    ? Number(BI.unsafeDivide(input, 1000n))
    : input;

  if (d) return `<t:${time}:d>`;
  if (D) return `<t:${time}:D>`;
  if (t) return `<t:${time}:t>`;
  if (T) return `<t:${time}:T>`;
  if (f) return `<t:${time}:f>`;
  if (F) return `<t:${time}:F>`;
  return `<t:${time}:R>`;
};
