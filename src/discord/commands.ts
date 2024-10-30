import type {CommandData, CommandSpec} from '#src/discord/types.ts';
import {FAQ} from '#src/discord/app-interactions/commands/faq.cmd.ts';
import {ONE_OF_US} from '#src/discord/app-interactions/commands/oneofus.cmd.ts';
import {CWL_SCOUT} from '#src/discord/app-interactions/commands/cwl-scout.cmd.ts';
import {CONFIG} from '#src/discord/app-interactions/commands/config/config.cmd.ts';
import {WAR_LINKS} from '#src/discord/app-interactions/commands/war-links.cmd.ts';
import {WAR_OPPONENT} from '#src/discord/app-interactions/commands/war-opponent.cmd.ts';
import {WAR_SCOUT} from '#src/discord/app-interactions/commands/war-scout.cmd.ts';
import {BOT} from '#src/discord/app-interactions/commands/bot/bot.cmd.ts';
import {SMOKE} from '#src/discord/app-interactions/commands/smoke/smoke.cmd.ts';

export const COMMANDS = {
    BOT,
    CONFIG,
    FAQ,
    SMOKE,
    ONE_OF_US,
    CWL_SCOUT,
    WAR_LINKS,
    WAR_OPPONENT,
    WAR_SCOUT,
} as const satisfies {[k in string]: CommandSpec};

export type CommandBody = CommandData<typeof COMMANDS[keyof typeof COMMANDS]>;
