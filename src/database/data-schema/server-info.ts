import {asKey, asLatest, SelectMetadata, toLatest} from '#src/database/data-arch/codec-standard.ts';
import {Id} from '#src/database/data-arch/id.ts';
import {DataTag} from '#src/database/data-const/index.ts';
import {DiscordInfo} from '#src/dynamo/schema/discord-info.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.SERVER_INFO,
  Id.ServerId,
  Id.InfoId,
  0,
);

export const Latest = asLatest(Key, {
  embed_id: Id.EmbedId,
  select  : SelectMetadata(Id.EmbedId),
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
      _tag    : Key._tag,
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
