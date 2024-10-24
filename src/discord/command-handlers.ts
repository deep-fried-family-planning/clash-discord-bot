import {warOpponent} from '#src/discord/app-interactions/commands/war-opponent.ts';
import {warScout} from '#src/discord/app-interactions/commands/war-scout.ts';
import {warLinks} from '#src/discord/app-interactions/commands/war-links.ts';
import {cwlScout} from '#src/discord/app-interactions/commands/cwl-scout.ts';
import {oneofus} from '#src/discord/app-interactions/commands/oneofus.ts';
import {faq} from '#src/discord/app-interactions/commands/faq.ts';
import {ONE_OF_US} from '#src/discord/app-interactions/commands/oneofus.cmd.ts';
import {FAQ} from '#src/discord/app-interactions/commands/faq.cmd.ts';
import {CONFIG} from '#src/discord/app-interactions/commands/config/config.cmd.ts';
import {CONFIG_SERVER} from '#src/discord/app-interactions/commands/config/server/config-server.cmd.ts';
import {CONFIG_SERVER_ADD} from '#src/discord/app-interactions/commands/config/server/server-add.cmd.ts';
import {configServerAdd} from '#src/discord/app-interactions/commands/config/server/server-add.ts';
import {CWL_SCOUT} from '#src/discord/app-interactions/commands/cwl-scout.cmd.ts';
import {WAR_LINKS} from '#src/discord/app-interactions/commands/war-links.cmd.ts';
import {WAR_OPPONENT} from '#src/discord/app-interactions/commands/war-opponent.cmd.ts';
import {WAR_SCOUT} from '#src/discord/app-interactions/commands/war-scout.cmd.ts';
import {cmdName} from '#src/discord/command-pipeline/cmd-name.ts';
import type {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {CONFIG_SERVER_EDIT} from '#src/discord/app-interactions/commands/config/server/server-edit.cmd.ts';
import {configServerEdit} from '#src/discord/app-interactions/commands/config/server/server-edit.ts';
import {BOT} from '#src/discord/app-interactions/commands/bot/bot.cmd.ts';
import {BOT_ABOUT} from '#src/discord/app-interactions/commands/bot/bot-about.cmd.ts';
import {botAbout} from '#src/discord/app-interactions/commands/bot/bot-about.ts';
import {smoke} from '#src/discord/app-interactions/commands/smoke/smoke.ts';
import {SMOKE} from '#src/discord/app-interactions/commands/smoke/smoke.cmd.ts';
import {REST_TIME, time} from '#src/discord-commands/time.ts';
import {
    CONFIG_SERVER_ADDCLAN,
    configServerAddclan,
} from '#src/discord/app-interactions/commands/config/server/server-addclan.ts';

export const COMMAND_HANDLERS = {
    [cmdName(BOT, BOT_ABOUT, BOT_ABOUT)]                   : botAbout,
    [cmdName(CONFIG, CONFIG_SERVER, CONFIG_SERVER_ADD)]    : configServerAdd,
    [cmdName(CONFIG, CONFIG_SERVER, CONFIG_SERVER_EDIT)]   : configServerEdit,
    [cmdName(CONFIG, CONFIG_SERVER, CONFIG_SERVER_ADDCLAN)]: configServerAddclan,
    [cmdName(ONE_OF_US, ONE_OF_US, ONE_OF_US)]             : oneofus,
    [cmdName(SMOKE, SMOKE, SMOKE)]                         : smoke,
    [cmdName(FAQ, FAQ, FAQ)]                               : faq,
    [cmdName(CWL_SCOUT, CWL_SCOUT, CWL_SCOUT)]             : cwlScout,
    [cmdName(WAR_LINKS, WAR_LINKS, WAR_LINKS)]             : warLinks,
    [cmdName(WAR_OPPONENT, WAR_OPPONENT, WAR_OPPONENT)]    : warOpponent,
    [cmdName(WAR_SCOUT, WAR_SCOUT, WAR_SCOUT)]             : warScout,
    [cmdName(REST_TIME, REST_TIME, REST_TIME)]             : time,
} as const satisfies {[key in string]: ReturnType<typeof specCommand>};
