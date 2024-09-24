import {badRequest} from '@hapi/boom';
import type {ServerModel} from '#src/data-store/codec/server-codec.ts';
import type {CommandData} from '#src/discord/types.ts';
import type {COMMANDS} from '#src/discord/commands.ts';

export const validateAdminRole = (server: ServerModel, body: CommandData<typeof COMMANDS[keyof typeof COMMANDS]>, failMsg: string) => {
    // if (!body.data.resolved || !('roles' in body.data.resolved) || !body.data.resolved.roles) {
    //     throw badRequest('Unrecognized context: Caller roles unresolved');
    // }

    if (!body.member!.roles.includes(server.roles.admin)) {
        throw badRequest(failMsg);
    }
};
