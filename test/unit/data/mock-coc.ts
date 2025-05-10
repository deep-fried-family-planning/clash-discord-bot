import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {vi} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

export const mockCoc = {
  getPlayer: vi.fn((tag: string) => E.succeed({} as any)),
  getClan  : vi.fn((tag: string) => E.succeed({} as any)),
};

export const mockCocLayer = L.succeed(ClashOfClans, ClashOfClans.make(mockCoc as any));
