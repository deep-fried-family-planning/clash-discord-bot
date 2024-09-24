import {badRequest} from '@hapi/boom';
import type {ServerModel} from '#src/data-store/codec/server-codec.ts';
import type {CommandBody} from '#src/discord/commands.ts';

export const validateAdminRole = (server: ServerModel, body: CommandBody, failMsg: string) => {
    // if (!body.data.resolved || !('roles' in body.data.resolved) || !body.data.resolved.roles) {
    //     throw badRequest('Unrecognized context: Caller roles unresolved');
    // }

    if (!body.member!.roles.includes(server.roles.admin)) {
        throw badRequest(failMsg);
    }
};
