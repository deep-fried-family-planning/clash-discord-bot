import {Codec} from '#src/database/data/index.ts';
import {DataDriver} from '#src/database/service/DataDriver.ts';
import {Data} from 'effect';

export * as UserRegistry from 'src/database/registry/user-registry.ts';
export type UserRegistry = never;

export const get = (userId: string) => DataDriver.use((d) =>
  d.readItemCached(
    Codec.User,
    userId,
    'now',
  ),
);

export const scanAll = () => {};

export const register = () => {};

export const update = () => {};
