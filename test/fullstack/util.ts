import {handler as poll} from '#src/lambdas/poll.ts';
import {handler as api} from '#src/lambdas/ix_api.ts';
import type {Interaction} from 'dfx/types';
import {Duration, Effect, RateLimiter} from 'effect';

export const fsCall = (interaction: Partial<Interaction>) =>
  Effect.promise(
    () => api({body: JSON.stringify(interaction)} as any),
  );

export const fsPoll = () =>
  Effect.promise(
    () => poll({}, {} as any),
  );
