import {E, LG, LL} from '#src/internal/pure/effect.ts';
import {Data, DateTime, Duration} from 'effect';

export class DevDebug extends Data.TaggedError('DisReact.DevDebug')<Record<string, unknown>> {}

export class Unimplemented extends Data.TaggedError('DisReact.Unimplemented')<Record<string, unknown>> {}

export class Impossible extends Data.TaggedError('DisReact.Impossible')<Record<string, unknown>> {}

export class Critical extends Data.TaggedError('DisReact.Critical')<Record<string, unknown>> {}

export const DoNotLog = E.provide(LG.minimumLogLevel(LL.None));

export const Latency = {};

export const InstanceTimestamp = () => (new Date(Date.now())).toISOString();

import { performance } from 'node:perf_hooks';

performance;

DateTime;
