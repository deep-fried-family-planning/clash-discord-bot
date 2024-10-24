import type {DurationInput} from 'effect/Duration';
import {E} from '#src/utils/effect.ts';

export const oopTimeout = <T>(duration: DurationInput, promise: () => Promise<T>) =>
    E.timeout(E.tryPromise(() => promise()), duration);
