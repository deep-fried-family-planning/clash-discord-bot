import {DF, E, O, pipe} from '#src/disreact/utils/re-exports.ts';
import {Exit, Fiber, Metric, Record} from 'effect';

export * as Misc from './misc.ts';
export type Misc = never;

export const pollFiber = <A, E>(fiber: Fiber.Fiber<A, E>) =>
  Fiber.poll(fiber).pipe(
    E.map((result) =>
      pipe(
        O.map(result, (r) => Exit.getOrElse(r, () => undefined)),
        O.getOrElse(() => undefined),
      ),
    ),
  );

export const pollDeferred = <A, E>(deferred: DF.Deferred<A, E>) =>
  DF.poll(deferred).pipe(
    E.flatMap((result) => E.transposeOption(result).pipe(
      E.map((result) =>
        O.getOrElse(result, () => undefined),
      ),
    )),
  );

const DecodeTime = Metric.timer('decode');
const EncodeTime = Metric.timer('encode');
const ModelTime = Metric.timer('model');
const RelayTime = Metric.timer('relay');
const DeferTime = Metric.timer('defer');
const DismountTime = Metric.timer('dismount');
const CreateTime = Metric.timer('create');
const ReplyTime = Metric.timer('reply');

export const trackDecodeTime = Metric.trackDuration(DecodeTime);
export const trackEncodeTime = Metric.trackDuration(EncodeTime);
export const trackModelTime = Metric.trackDuration(ModelTime);
export const trackRelayTime = Metric.trackDuration(RelayTime);
export const trackDeferTime = Metric.trackDuration(DeferTime);
export const trackDismountTime = Metric.trackDuration(DismountTime);
export const trackCreateTime = Metric.trackDuration(CreateTime);
export const trackReplyTime = Metric.trackDuration(ReplyTime);

export const displayMetrics = pipe(
  E.all({
    decode  : Metric.value(DecodeTime),
    encode  : Metric.value(EncodeTime),
    model   : Metric.value(ModelTime),
    relay   : Metric.value(RelayTime),
    defer   : Metric.value(DeferTime),
    dismount: Metric.value(DismountTime),
    create  : Metric.value(CreateTime),
    reply   : Metric.value(ReplyTime),
  }),
  E.map((metrics) =>
    Record.map(metrics, (m) => {
      return {
        average: m.sum / m.count,
        max    : m.max,
        min    : m.min,
        count  : m.count,
      };
    }),
  ),
  E.tap((metrics) => E.log(metrics)),
);
