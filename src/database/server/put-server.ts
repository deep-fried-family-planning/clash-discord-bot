import type {ServerModel} from '#src/database/codec/server-codec.ts';
import {getServer} from '#src/database/server/get-server.ts';
import {ddbPutServer} from '#src/database/codec/server-codec-ddb.ts';
import {conflict} from '@hapi/boom';

export const putServer = async (model: ServerModel, canThrow?: boolean) => {
    if (canThrow) {
        const exists = await getServer(model.id);

        if (exists) {
            throw conflict(`${model.id} already exists`);
        }
    }

    return await ddbPutServer(model);
};
