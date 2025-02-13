import {Rest} from '#src/disreact/abstract/index.ts';
import {pipe, S} from '#src/internal/pure/effect.ts';


const stuff = {
  app_permissions               : '2251799813685247',
  application_id                : '1256809603715436606',
  authorizing_integration_owners: {0: '1287829383544963154'},
  channel                       : {
    flags              : 0,
    guild_id           : '1287829383544963154',
    id                 : '1317321691809972254',
    last_message_id    : '1339069663870586920',
    member_count       : 2,
    member_ids_preview : ['267835119421751306', '644290645350940692'],
    message_count      : 118,
    name               : 'dev omni',
    owner_id           : '644290645350940692',
    parent_id          : '1298154982641500182',
    permissions        : '2251799813685247',
    rate_limit_per_user: 0,
    thread_metadata    : {
      archive_timestamp    : '2024-12-14T02:46:05.981000+00:00',
      archived             : false,
      auto_archive_duration: 4320,
      create_timestamp     : '2024-12-14T02:46:05.981000+00:00',
      locked               : false,
    },
    total_message_sent: 171,
    type              : 11,
  },
  channel_id: '1317321691809972254',
  context   : 0,
  data      : {
    components: [
      {
        components: [{custom_id: 'modal:0:text:0', type: 4, value: 'asdf'}],
        type      : 1,
      },
      {
        components: [{custom_id: 'modal:0:text:1', type: 4, value: 'asdf'}],
        type      : 1,
      },
      {
        components: [{custom_id: 'modal:0:text:2', type: 4, value: 'asdf'}],
        type      : 1,
      },
      {
        components: [{custom_id: 'modal:0:text:3', type: 4, value: 'asdf'}],
        type      : 1,
      },
      {
        components: [{custom_id: 'modal:0:text:4', type: 4, value: 'asdf'}],
        type      : 1,
      },
    ],
    custom_id: '/dsx/LinkDialog/5/64/1339071720211873792/1739330817438/-',
  },
  entitlement_sku_ids: [],
  entitlements       : [],
  guild              : {
    features: ['AUTO_MODERATION', 'NEWS', 'COMMUNITY'],
    id      : '1287829383544963154',
    locale  : 'en-US',
  },
  guild_id    : '1287829383544963154',
  guild_locale: 'en-US',
  id          : '1339073791090757696',
  locale      : 'en-US',
  member      : {
    avatar                      : null,
    banner                      : null,
    communication_disabled_until: null,
    deaf                        : false,
    flags                       : 0,
    joined_at                   : '2024-09-23T17:34:11.807000+00:00',
    mute                        : false,
    nick                        : null,
    pending                     : false,
    permissions                 : '2251799813685247',
    premium_since               : null,
    roles                       : ['1298138273478086689'],
    unusual_dm_activity_until   : null,
    user                        : {
      avatar                : '7ad8c035b5caa70e2132e550aba50fcf',
      avatar_decoration_data: null,
      clan                  : null,
      discriminator         : '0',
      global_name           : 'NotStr8DontH8',
      id                    : '644290645350940692',
      primary_guild         : null,
      public_flags          : 4194304,
      username              : 'yourguyryry',
    },
  },
  message: {
    application_id: '1256809603715436606',
    attachments   : [],
    author        : {
      avatar                : '5f71735406403cdc51158038e24bb671',
      avatar_decoration_data: null,
      bot                   : true,
      clan                  : null,
      discriminator         : '5344',
      global_name           : null,
      id                    : '1256809603715436606',
      primary_guild         : null,
      public_flags          : 524288,
      username              : 'QualDeepFryer',
    },
    channel_id: '1317321691809972254',
    components: [
      {
        components: [
          {
            custom_id: 'buttons:1:button:0',
            id       : 2,
            label    : 'Back',
            style    : 2,
            type     : 2,
          },
          {
            custom_id: 'CloseButton:1:button:0',
            id       : 3,
            label    : 'Close 0',
            style    : 1,
            type     : 2,
          },
          {
            custom_id: 'buttons:1:button:2',
            id       : 4,
            label    : 'Modal',
            style    : 2,
            type     : 2,
          },
        ],
        id  : 1,
        type: 1,
      },
    ],
    content         : '',
    edited_timestamp: '2025-02-12T03:13:02.128660+00:00',
    embeds          : [
      {
        content_scan_version: 0,
        description         : 'Use the buttons below to link new accounts and manage your settings with DeepFryer.',
        image               : {
          flags    : 0,
          height   : 0,
          proxy_url: 'https://images-ext-1.discordapp.net/external/yHQXUMuE4roeVMyG5Ecv-2aVBCFTWfU3KNdWH77RAgQ/%3FLink%253A0%253Amessage%253A0%253Abuttons%253A1%253ACloseButton%253A1%3D%25255B%25257B%252522s%252522%25253A0%25257D%25252C%25257B%25257D%25255D/https/dffp.org/dsx/Link/5/64/1339071720211873792/1739330817438/aW50ZXJhY3Rpb246MTMzOTA3MTcyMDIxMTg3Mzc5MjpuU2ZTTlYyWURvWmZpelJCYmZhWTJ4d29zSXNYY0tzc2w3QzBXM3hGTmNxaXRGaWpxQWVDTEZ1aHRvRmtaN3UyVk1MME41TjJJWTg3QXRhNWQ4S3hGN0tGS1N0aVhUV0pPOUVJVG01UHZneHk3ZHk1YmZPUzBvenk3RlV1VzJUTA',
          url      : 'https://dffp.org/dsx/Link/5/64/1339071720211873792/1739330817438/aW50ZXJhY3Rpb246MTMzOTA3MTcyMDIxMTg3Mzc5MjpuU2ZTTlYyWURvWmZpelJCYmZhWTJ4d29zSXNYY0tzc2w3QzBXM3hGTmNxaXRGaWpxQWVDTEZ1aHRvRmtaN3UyVk1MME41TjJJWTg3QXRhNWQ4S3hGN0tGS1N0aVhUV0pPOUVJVG01UHZneHk3ZHk1YmZPUzBvenk3RlV1VzJUTA?Link%3A0%3Amessage%3A0%3Abuttons%3A1%3ACloseButton%3A1=%255B%257B%2522s%2522%253A0%257D%252C%257B%257D%255D',
          width    : 0,
        },
        title: 'Link Management',
        type : 'rich',
      },
    ],
    flags               : 64,
    id                  : '1339071723470979082',
    interaction_metadata: {
      authorizing_integration_owners: {0: '1287829383544963154'},
      id                            : '1339071720211873792',
      interacted_message_id         : '1339069663870586920',
      type                          : 3,
      user                          : {
        avatar                : '7ad8c035b5caa70e2132e550aba50fcf',
        avatar_decoration_data: null,
        clan                  : null,
        discriminator         : '0',
        global_name           : 'NotStr8DontH8',
        id                    : '644290645350940692',
        primary_guild         : null,
        public_flags          : 4194304,
        username              : 'yourguyryry',
      },
    },
    mention_everyone : false,
    mention_roles    : [],
    mentions         : [],
    message_reference: {
      channel_id: '1317321691809972254',
      guild_id  : '1287829383544963154',
      message_id: '1339069663870586920',
      type      : 0,
    },
    pinned    : false,
    position  : 171,
    timestamp : '2025-02-12T03:12:57.625000+00:00',
    tts       : false,
    type      : 19,
    webhook_id: '1256809603715436606',
  },
  type   : 5,
  version: 1,
};

const SnowFlake = S.String;
const CustomId = S.String;
const BitField = S.String;
const InteractionToken = S.Redacted(S.String);
const Locale = S.String;


const RestDialogDataText = S.Struct({});

RestDialogDataText.make;

const RestDialogData = S.TaggedStruct('dialog', {
  custom_id : CustomId,
  components: pipe(
    S.Struct({
      type      : S.Number,
      components: pipe(
        S.Struct({
          custom_id: CustomId,
          value    : S.String,
        }),
        S.Array,
        S.maxItems(1),
      ),
    }),
    S.Array,
    S.maxItems(5),
  ),
});


const RestButtonData = S.TaggedStruct('button', {
  custom_id     : CustomId,
  component_type: S.Number,
});


const RestSelectData = S.TaggedStruct('select', {
  custom_id     : CustomId,
  component_type: S.Number,
  values        : S.Array(S.String).pipe(S.maxItems(25)),
});


const RestAutoSelectData = S.TaggedStruct('autoSelect', {
  custom_id     : CustomId,
  component_type: S.Number,
  values        : S.Array(S.String),
  resolved      : S.Struct({
    // todo
  }),
});


export const RestInteraction = S.Struct({
  version        : S.Literal(1),
  application_id : SnowFlake,
  app_permissions: BitField,
  id             : SnowFlake,
  token          : InteractionToken,
  type           : S.Enums(Rest.Rx),
  context        : S.Enums(Rest.Discord.InteractionContextType),

  data: S.Union(RestDialogData, RestButtonData, RestSelectData, RestAutoSelectData),

  channel   : S.Struct({}),
  channel_id: SnowFlake,

  guild       : S.Struct({}),
  guild_id    : SnowFlake,
  guild_locale: Locale,

  locale: Locale,
  member: S.Struct({}),
});
