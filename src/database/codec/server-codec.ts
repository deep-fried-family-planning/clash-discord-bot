import type {Codec, Store} from '#src/database/types.ts';
import type {
    CocClanCategory,
    CocClanTag, DDB_ServerHashKey,
    DiscordChannelId, DiscordRoleId,
    OpinionatedConfigToggle,
} from '#src/database/types.data.ts';
import type {ServerRecord} from '#src/database/schema/server-record.ts';

type ClanChannel = DiscordChannelId;
type ClanRole = DiscordRoleId;
type AdminRole = DiscordRoleId;
type HomeURL = string;
type FaqURL = DiscordRoleId;

export type ServerModel = ServerRecord;

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
