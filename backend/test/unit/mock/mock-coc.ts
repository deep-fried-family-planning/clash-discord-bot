import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {vi} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

export const mockCoc = {
  verifyPlayerToken: vi.fn((tag: string, token: string) => E.succeed(false as any)),
  getPlayer        : vi.fn((tag: string) => E.succeed({} as any)),
  getClan          : vi.fn((tag: string) => E.succeed({} as any)),
};

export const mockCocLayer = L.succeed(ClashOfClans, ClashOfClans.make(mockCoc as any));
