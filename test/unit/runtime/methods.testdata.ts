import { SNAP } from '../scenarios/snapkey';
import { Snap } from 'test/unit/scenarios/util.ts';

export const testmessage = await import(Snap.key(SNAP.TEST_MESSAGE));
