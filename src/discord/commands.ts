import type {CommandData, CommandSpec} from '#src/discord/types.ts';
import {TIME} from '#src/aws-lambdas/slash/commands/time.ts';
import {ONE_OF_US} from '#src/aws-lambdas/slash/commands/oneofus.ts';
import {SERVER} from '#src/aws-lambdas/slash/commands/server.ts';
import {CLAN_FAM} from '#src/aws-lambdas/slash/commands/clanfam.ts';
import {USER} from '#src/aws-lambdas/slash/commands/user';

export const COMMANDS = {
    ONE_OF_US,
    TIME,
    SERVER,
    CLAN_FAM,
    USER,
} as const satisfies {[k in string]: CommandSpec};

export type CommandBody = any;
