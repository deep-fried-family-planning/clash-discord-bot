import {badRequest} from '@hapi/boom';
import type {ServerModel} from '#src/database/codec/server-codec.ts';
import type {CommandBody} from '#src/discord/commands.ts';

export const validateAdminRole = (server, body, failMsg) => {
    // if (!body.data.resolved || !('roles' in body.data.resolved) || !body.data.resolved.roles) {
    //     throw badRequest('Unrecognized context: Caller roles unresolved');
    // }

    if (!body.member!.roles.includes(server.roles.admin)) {
        throw badRequest(failMsg);
    }
};
