import type {DDB_ServerHashKey} from '#src/data-store/types.data.ts';
import {aws_ddb} from '#src/lambdas/client-aws-ddb.ts';
import {SERVER_CODEC, type ServerModel, type ServerStore} from '#src/data-store/codec/server-codec.ts';

export const ddbGetServer = async (id: DDB_ServerHashKey) => {
    const {Item} = await aws_ddb.get({
        TableName: process.env.DDB_SERVER,
        Key      : {id},
    });

    if (!Item) {
        return undefined;
    }

    const store = Item as ServerStore[number];

    return SERVER_CODEC[store.version].model(store);
};

export const ddbPutServer = async (model: ServerModel) => {
    const store = SERVER_CODEC[model.version as keyof typeof SERVER_CODEC].store(model);

    await aws_ddb.put({
        TableName: process.env.DDB_SERVER,
        Item     : store,
    });

    return model;
};