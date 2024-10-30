import type {Codec, Model, Store} from '#src/database/types.ts';
import type {
    CocPlayerTag,
    CocPlayerVerified,
    DiscordUserId,
} from '#src/database/types.data.ts';
import {mapL, reduceL} from '#src/pure/pure-list.ts';
import {pipe} from '#src/utils/effect.ts';
import {toEntries} from 'effect/Record';

export type PlayerLinksModel = Model<{
    id     : 'player-links';
    players: {
        [k in CocPlayerTag]: {
            user    : DiscordUserId;
            verified: CocPlayerVerified;
        }
    };
    users: {
        [k in DiscordUserId]: CocPlayerTag[]
    };
}>;

export type PlayerLinksStoreV1_0_0 = Store<'1.0.0', {
    id: 'player-links';
    p : [CocPlayerTag, DiscordUserId, CocPlayerVerified][];
}>;

export type PlayerLinksStore = [PlayerLinksStoreV1_0_0];

export const PLAYER_LINKS_CODEC_LATEST = '1.0.0';

export const PLAYER_LINKS_CODEC: Codec<PlayerLinksModel, PlayerLinksStore> = {
    ['1.0.0']: {
        // @ts-expect-error early optimization is the devil!
        model: (store) => ({
            id      : store.id,
            version : PLAYER_LINKS_CODEC_LATEST,
            migrated: store.migrated,
            players : pipe(store.p, reduceL(
                {} as PlayerLinksModel['players'],
                (acc, [tag, userId, verified]) => {
                    acc[tag] = {
                        user    : userId,
                        verified: verified,
                    };
                    return acc;
                },
            )),
            users: pipe(store.p, reduceL(
                {} as PlayerLinksModel['users'],
                (acc, [tag, userId]) => {
                    acc[userId] ??= [];
                    acc[userId].push(tag);
                    return acc;
                },
            )),
        }),
        // @ts-expect-error early optimization is the devil!
        store: (model) => ({
            id      : model.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment
            version : model.version as any,
            migrated: model.migrated,
            p       : pipe(model.players, toEntries, mapL(([tag, player]) => [tag, player.user, player.verified])),
        }),
    },
};
