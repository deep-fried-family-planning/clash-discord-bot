import {SNAP} from 'test/unit/snapkey.ts';
import {Snap} from 'test/unit/util.ts';

export const testmessage = await import(Snap.key(SNAP.TEST_MESSAGE));
