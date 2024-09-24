import {warOpponent} from '#src/discord/commands/war-opponent.ts';
import {warScout} from '#src/discord/commands/war-scout.ts';
import {warLinks} from '#src/discord/commands/war-links.ts';
import {cwlScout} from '#src/discord/commands/cwl-scout.ts';
import {oneofus} from '#src/discord/commands/oneofus.ts';
import {faq} from '#src/discord/commands/faq.ts';
import {ONE_OF_US} from '#src/discord/commands/oneofus.cmd.ts';
import {FAQ} from '#src/discord/commands/faq.cmd.ts';
import {CONFIG} from '#src/discord/commands/config.cmd.ts';
import {CONFIG_SERVER} from '#src/discord/commands/config/server/config-server.cmd.ts';
import {CONFIG_SERVER_ADD} from '#src/discord/commands/config/server/server-add.cmd.ts';
import {configServerAdd} from '#src/discord/commands/config/server/server-add.ts';
import {CWL_SCOUT} from '#src/discord/commands/cwl-scout.cmd.ts';
import {WAR_LINKS} from '#src/discord/commands/war-links.cmd.ts';
import {WAR_OPPONENT} from '#src/discord/commands/war-opponent.cmd.ts';
import {WAR_SCOUT} from '#src/discord/commands/war-scout.cmd.ts';
import {cmdName} from '#src/discord/command-pipeline/cmd-name.ts';
import type {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';

export const COMMAND_HANDLERS = {
    [cmdName(CONFIG, CONFIG_SERVER, CONFIG_SERVER_ADD)]: configServerAdd,
    [cmdName(ONE_OF_US, ONE_OF_US, ONE_OF_US)]         : oneofus,
    [cmdName(FAQ, FAQ, FAQ)]                           : faq,
    [cmdName(CWL_SCOUT, CWL_SCOUT, CWL_SCOUT)]         : cwlScout,
    [cmdName(WAR_LINKS, WAR_LINKS, WAR_LINKS)]         : warLinks,
    [cmdName(WAR_OPPONENT, WAR_OPPONENT, WAR_OPPONENT)]: warOpponent,
    [cmdName(WAR_SCOUT, WAR_SCOUT, WAR_SCOUT)]         : warScout,
} as const satisfies {[key in string]: ReturnType<typeof specCommand>};
