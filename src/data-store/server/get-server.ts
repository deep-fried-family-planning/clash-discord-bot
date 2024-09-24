import type {DDB_ServerHashKey} from '#src/data-store/types.data.ts';
import {ddbGetServer} from '#src/data-store/codec/server-codec-ddb.ts';
import {notFound} from '@hapi/boom';

export const getServer = async (id: DDB_ServerHashKey, canThrow?: boolean) => {
    const model = await ddbGetServer(id);

    if (!model && canThrow) {
        throw notFound(`Server record not found: ${id}`);
    }

    return model;
};

export const getServerReject = async (id: DDB_ServerHashKey) => {
    const model = await ddbGetServer(id);

    if (!model) {
        throw notFound(`Server record not found: ${id}`);
    }

    return model;
};
