import {
    PLAYER_LINKS_CODEC,
    type PlayerLinksModel,
    type PlayerLinksStore,
} from '#src/database/codec/player-links-codec.ts';
import {aws_ddb} from '#src/api/aws-ddb.ts';

export const ddbGetPlayerLinks = async () => {
    const {Item} = await aws_ddb.get({
        TableName: process.env.DDB_SERVER,
        Key      : {id: 'player-links'},
    });

    if (!Item) {
        return undefined;
    }

    const store = Item as PlayerLinksStore[number];

    return PLAYER_LINKS_CODEC[store.version].model(store);
};

export const ddbPutPlayerLinks = async (model: PlayerLinksModel) => {
    const store = PLAYER_LINKS_CODEC[model.version as keyof typeof PLAYER_LINKS_CODEC].store(model);

    await aws_ddb.put({
        TableName: process.env.DDB_SERVER,
        Item     : store,
    });

    return model;
};
