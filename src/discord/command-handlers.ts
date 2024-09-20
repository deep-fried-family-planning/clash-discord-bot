import {warOpponent} from '#src/discord/commands/war-opponent.ts';
import {warScout} from '#src/discord/commands/war-scout.ts';
import {warLinks} from '#src/discord/commands/war-links.ts';
import {cwlScout} from '#src/discord/commands/cwl-scout.ts';
import {testDffp} from '#src/discord/commands/test-dffp.ts';
import {oneofus} from '#src/discord/commands/oneofus.ts';

export const COMMAND_HANDLERS = [
    testDffp,
    oneofus,
    cwlScout,
    warLinks,
    warOpponent,
    warScout,
] as const;
