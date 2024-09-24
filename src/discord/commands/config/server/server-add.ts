import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {CONFIG_SERVER_ADD} from '#src/discord/commands/config/server/server-add.cmd.ts';

export const configServerAdd = specCommand<typeof CONFIG_SERVER_ADD>(async (body) => {
    return [{
        desc: ['test'],
    }];
});
