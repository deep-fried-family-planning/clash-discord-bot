import {Schema} from 'effect';

export type ServerRecord = Schema.Schema.Type<typeof SERVER_RECORD> & {};

export const SERVER_RECORD = Schema.Struct({
    version: Schema.String,

    id: Schema.String,

    roles: Schema.Struct({
        admin: Schema.String,
    }),
    channels: Schema.Struct({
        war_room: Schema.String,
    }),
    clans: Schema.Record({
        key  : Schema.String,
        value: Schema.Struct({
            war_status           : Schema.Int,
            war_prep_opponent    : Schema.String,
            war_prep_thread      : Schema.String,
            war_battle_opponent  : Schema.String,
            war_battle_thread    : Schema.String,
            war_countdown_channel: Schema.String,
        }),
    }),
    urls: Schema.Struct({
        home: Schema.String,
        faq : Schema.String,
    }),
});

export const SERVER_RECORD_EQ = Schema.equivalence(SERVER_RECORD);
