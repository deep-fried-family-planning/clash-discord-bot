import type {Boom} from '@hapi/boom';

export const asBoom = (e: unknown) => e as Error | Boom;
