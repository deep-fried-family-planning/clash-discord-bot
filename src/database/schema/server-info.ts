import {asKey, asLatest, SelectMetadata, toLatest} from '#src/database/setup/arch.ts';
import {PkSk, DataTag} from '#src/database/setup/index.ts';
import {DiscordInfo} from '#src/dynamo/schema/discord-info';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.SERVER_INFO,
  PkSk.ServerId,
  PkSk.InfoId,
  0,
);

export const Latest = asLatest(Key, {
  embed_id: PkSk.EmbedId,
  select  : SelectMetadata(PkSk.EmbedId),
  kind    : S.Enums({
    omni : 'omni',
    about: 'about',
    guide: 'guide',
    rule : 'rule',
  } as const),
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordInfo, (enc) => {
    return {
      _tag    : Key.tag,
      version : Key.latest,
      upgraded: true,
      pk      : enc.pk,
      sk      : enc.sk,
      created : DateTime.unsafeMake(enc.created),
      updated : DateTime.unsafeMake(enc.updated),
      embed_id: enc.embed_id ?? '',
      kind    : enc.kind,
      select  : {
        value      : enc.embed_id ?? '',
        label      : enc.selector_label ?? enc.embed_id ?? '',
        description: enc.selector_desc ?? enc.desc ?? '',
      },
    } as const;
  }),
);
