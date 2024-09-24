import type {ServerModel} from '#src/data-store/codec/server-codec.ts';
import {getServer} from '#src/data-store/server/get-server.ts';
import {ddbPutServer} from '#src/data-store/codec/server-codec-ddb.ts';
import {badRequest} from '@hapi/boom';

export const putServer = async (model: ServerModel, canThrow?: boolean) => {
    if (canThrow) {
        const exists = await getServer(model.id);

        if (exists) {
            throw badRequest(`${model.id} already exists`);
        }
    }

    return await ddbPutServer(model);
};
