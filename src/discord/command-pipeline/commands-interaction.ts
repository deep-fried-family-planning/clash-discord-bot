import type {Interaction} from '#src/discord/types.ts';
import {GROUP_OPTION, SUBCMD_OPTION} from '#src/discord/commands-constants.ts';
import type {COMMAND_HANDLERS} from '#src/discord/command-handlers.ts';
import {cmdName} from '#src/discord/command-pipeline/cmd-name.ts';

export const getHandlerKey = (body: Interaction): keyof typeof COMMAND_HANDLERS => {
    const cmd = body.data;

    if (!('options' in body.data) || !body.data.options?.length) {
        return cmdName(cmd, cmd, cmd);
    }

    const [first] = body.data.options;

    if (first.type === GROUP_OPTION) {
        const [second] = first.options;

        return cmdName(cmd, first, second);
    }
    else if (first.type === SUBCMD_OPTION) {
        return cmdName(cmd, first, first);
    }

    return cmdName(cmd, cmd, cmd);
};
