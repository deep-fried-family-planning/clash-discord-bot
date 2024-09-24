import type {Codec, Model, Store} from '#src/data-store/types.ts';
import type {
    CocClanCategory,
    CocClanTag, DDB_ServerHashKey,
    DiscordChannelId, DiscordRoleId,
    OpinionatedConfigToggle,
} from '#src/data-store/types.data.ts';
import {pipe} from 'fp-ts/function';
import {mapKV} from '#src/data/pure-kv.ts';

type ClanChannel = DiscordChannelId;
type ClanRole = DiscordRoleId;
type AdminRole = DiscordRoleId;
type HomeURL = string;
type FaqURL = DiscordRoleId;

export type ServerModel = Model<{
    id         : DDB_ServerHashKey;
    opinionated: OpinionatedConfigToggle;
    roles: {
        admin: AdminRole;
    };
    clans: {
        [k in CocClanTag]: {
            category: CocClanCategory;
            channel : DiscordChannelId;
            role    : ClanRole;
        };
    };
    urls: {
        home: HomeURL;
        faq : FaqURL;
    };
}>;

export type ServerStoreV1_0_0 = Store<'1.0.0', {
    id: DDB_ServerHashKey;
    o : OpinionatedConfigToggle;
    r : [AdminRole];
    c: {
        [k in CocClanTag]: [CocClanCategory, ClanChannel, ClanRole];
    };
    u: [HomeURL, FaqURL];
}>;

export type ServerStore = readonly [
    ServerStoreV1_0_0,
];

export type ServerCodec = Codec<ServerModel, ServerStore>;

export const SERVER_CODEC_LATEST = '1.0.0';

export const SERVER_CODEC: ServerCodec = {
    ['1.0.0']: {
        model: (store) => {
            const u = 'u' in store
                ? store.u
                : ['', ''];

            return {
                id         : store.id,
                version    : SERVER_CODEC_LATEST,
                migrated   : store.migrated,
                opinionated: store.o,
                roles      : {
                    admin: store.r[0],
                },
                clans: pipe(store.c, mapKV((clan) => ({
                    category: clan[0],
                    channel : clan[1],
                    role    : clan[2],
                }))),
                urls: {
                    home: u[0],
                    faq : u[1],
                },
            };
        },
        store: (model) => ({
            id      : model.id,
            version : '1.0.0',
            migrated: model.migrated,
            o       : model.opinionated,
            r       : [model.roles.admin],
            c       : pipe(model.clans, mapKV((clan) => [
                clan.category,
                clan.channel,
                clan.role,
            ])),
            u: [model.urls.home, model.urls.faq],
        }),
    },
};
