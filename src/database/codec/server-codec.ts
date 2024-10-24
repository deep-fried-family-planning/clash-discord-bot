import type {Codec, Model, Store} from '#src/database/types.ts';
import type {
    CocClanCategory,
    CocClanTag, DDB_ServerHashKey,
    DiscordChannelId, DiscordRoleId,
    OpinionatedConfigToggle,
} from '#src/database/types.data.ts';

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
    channels: {
        war_room: DiscordChannelId;
    };
    clans: {
        [k in CocClanTag]: {
            war_status         : 0 | 1;
            war_thread_current : DiscordChannelId;
            war_thread_previous: DiscordChannelId;
            war_countdown      : DiscordChannelId;
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

// eslint-disable-next-line @stylistic/comma-dangle
export type ServerStore = readonly [
    (Store & ServerModel),
];

export type ServerCodec = Codec<ServerModel, ServerStore>;

export const SERVER_CODEC_LATEST = '1.0.0';

export const SERVER_CODEC: ServerCodec = {
    ['1.0.0']: {
        model: (store) => ({
            ...store,
        }),
        store: (model) => ({
            ...model,
        }),
    },
};
