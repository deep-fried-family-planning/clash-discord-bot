import type {CompKey} from '#src/dynamo/dynamo.ts';
import {ClanTag, EmbedId, RosterId, ServerId} from '#src/dynamo/schema/common.ts';
import {Schema as S} from 'effect';

export type DRoster = S.Schema.Type<typeof DiscordRoster>;
export type DRosterKey = CompKey<DRoster>;

export const DiscordRoster = S.Struct({
  type: S.Literal('DiscordRoster'),
  pk  : ServerId,
  sk  : RosterId,

  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  embed_id      : S.optional(EmbedId),
  selector_label: S.optional(S.String),
  selector_desc : S.optional(S.String),
  selector_order: S.optional(S.Number),

  search_time: S.DateTimeUtc,
  roster_type: S.Enums({
    cwl            : 'cwl',
    cwlatlarge     : 'cwl-at-large',
    war            : 'war',
    waratlarge     : 'war-at-large',
    odcwl          : 'odcwl',
    odcwlatlarge   : 'odcwl-at-large',
    friendly       : 'friendly',
    friendlyatlarge: 'friendly-at-large',
  } as const),
  clan: S.optional(ClanTag),

  // deprecated
  name       : S.optional(S.String),
  description: S.optional(S.String),
});

export const decodeDiscordRoster = S.decodeUnknown(DiscordRoster);
export const encodeDiscordRoster = S.encodeUnknown(DiscordRoster);
