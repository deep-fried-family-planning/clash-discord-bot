import {DT, flow, pipe} from '#pure/effect';
import type {num} from '#src/internal/pure/types-pure.ts';


export const activeTimeFromNow = flow(
  DT.unsafeNow,
  DT.add({minutes: 12}),
  DT.toEpochMillis,
);


export const isStillActiveTime = (active: num) => pipe(
  DT.unsafeMake(active),
  DT.greaterThan(DT.unsafeNow()),
);
