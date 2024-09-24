import type {CommandSpec} from '#src/discord/types.ts';
import {FAQ} from '#src/discord/commands/faq.cmd.ts';
import {ONE_OF_US} from '#src/discord/commands/oneofus.cmd.ts';
import {CWL_SCOUT} from '#src/discord/commands/cwl-scout.cmd.ts';
import {CONFIG} from '#src/discord/commands/config/config.cmd.ts';
import {WAR_LINKS} from '#src/discord/commands/war-links.cmd.ts';
import {WAR_OPPONENT} from '#src/discord/commands/war-opponent.cmd.ts';
import {WAR_SCOUT} from '#src/discord/commands/war-scout.cmd.ts';
import {BOT} from '#src/discord/commands/bot/bot.cmd.ts';

export const COMMANDS = {
    BOT,
    CONFIG,
    FAQ,
    ONE_OF_US,
    CWL_SCOUT,
    WAR_LINKS,
    WAR_OPPONENT,
    WAR_SCOUT,
} as const satisfies {[k in string]: CommandSpec};
