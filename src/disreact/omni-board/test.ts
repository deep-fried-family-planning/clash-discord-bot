import {DisReactDOM} from '#src/disreact/index.ts';
import {jsx} from '#src/disreact/jsx-runtime.ts';
import {OmniStart} from '#src/disreact/omni-board/omni-start.tsx';
import {E} from '#src/internal/pure/effect.ts';
import testdata from './testdata.json';



const done = jsx(OmniStart, {});


await E.runPromise(DisReactDOM.synthesize(OmniStart));


await E.runPromise(DisReactDOM.respond(testdata));

// await E.runPromise(DisReactDOM.respond(
//   {
//     app_permissions               : '2251799813685247', application_id                : '1256809603715436606', authorizing_integration_owners: {0: '1287829383544963154'}, channel                       : {flags: 0, guild_id: '1287829383544963154', id: '1317321691809972254', last_message_id: '1332803630918533120', member_count: 2, member_ids_preview: ['267835119421751306', '644290645350940692'], message_count: 110, name: 'dev omni', owner_id: '644290645350940692', parent_id: '1298154982641500182', permissions: '2251799813685247', rate_limit_per_user: 0, thread_metadata: {archive_timestamp: '2024-12-14T02:46:05.981000+00:00', archived: false, auto_archive_duration: 4320, create_timestamp: '2024-12-14T02:46:05.981000+00:00', locked: false}, total_message_sent: 142, type: 11}, channel_id                    : '1317321691809972254', context                       : 0, data                          : {component_type: 2, custom_id: '1'}, entitlement_sku_ids           : [], entitlements                  : [], guild                         : {features: ['AUTO_MODERATION', 'NEWS', 'COMMUNITY'], id: '1287829383544963154', locale: 'en-US'}, guild_id                      : '1287829383544963154', guild_locale                  : 'en-US', id                            : '1333651653106077811', locale                        : 'en-US', member                        : {avatar: null, banner: null, communication_disabled_until: null, deaf: false, flags: 0, joined_at: '2024-09-23T17:34:11.807000+00:00', mute: false, nick: null, pending: false, permissions: '2251799813685247', premium_since: null, roles: ['1298138273478086689'], unusual_dm_activity_until: null, user: {avatar: '7ad8c035b5caa70e2132e550aba50fcf', avatar_decoration_data: null, clan: null, discriminator: '0', global_name: 'NotStr8DontH8', id: '644290645350940692', primary_guild: null, public_flags: 4194304, username: 'yourguyryry'}}, message                       : {
//       application_id: '1256809603715436606', attachments: [], author: {avatar: '5f71735406403cdc51158038e24bb671', avatar_decoration_data: null, bot: true, clan: null, discriminator: '5344', global_name: null, id: '1256809603715436606', primary_guild: null, public_flags: 524288, username: 'QualDeepFryer'}, channel_id: '1317321691809972254', components: [{components: [{custom_id: '1', id: 2, label: 'src:intrinsic element', style: 1, type: 2}, {custom_id: '2', id: 3, label: 'src:intrinsic element2', style: 1, type: 2}, {custom_id: '3', id: 4, label: 'src:react fragment', style: 1, type: 2}, {custom_id: 'from function component', id: 5, label: 'src:function component ref', style: 1, type: 2}], id: 1, type: 1}], content: '', edited_timestamp: null, embeds: [], flags: 0, id: '1332803630918533120', interaction: {id: '1332803629672960194', name: 'smoke', type: 2, user: {avatar: '7ad8c035b5caa70e2132e550aba50fcf', avatar_decoration_data: null, clan: null, discriminator: '0', global_name: 'NotStr8DontH8', id: '644290645350940692', primary_guild: null, public_flags: 4194304, username: 'yourguyryry'}}, interaction_metadata: {authorizing_integration_owners: {0: '1287829383544963154'}, command_type: 1, id: '1332803629672960194', name: 'smoke', type: 2, user: {avatar: '7ad8c035b5caa70e2132e550aba50fcf', avatar_decoration_data: null, clan: null, discriminator: '0', global_name: 'NotStr8DontH8', id: '644290645350940692', primary_guild: null, public_flags: 4194304, username: 'yourguyryry'}}, mention_everyone: false, mention_roles: [], mentions: [], pinned: false, position: 141, timestamp: '2025-01-25T20:05:47.905000+00:00', tts: false, type: 20, webhook_id: '1256809603715436606',
//     }, token: 'aW50ZXJhY3Rpb246MTMzMzY1MTY1MzEwNjA3NzgxMTpYQktNSzk5Y1REZm41RjdNQVlhMHJHajRLV3hJcGpoaEt1a0t1UDZlSmZSTlRQbUt6czhDUDdYQlBDVHVBaUhObzZIODBtbzBaS0Faams0bGwzU1NYUjZWMGpsclI4MkpETE5LWm9TbUZ0cUZ6NWZ2SjRqbjZGZ1hWS21mdVBnWA', type: 3, version: 1,
//   },
// ));
