import type {DRoster} from '#src/internal/discord-old/dynamo/schema/discord-roster.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';

export const viewServerRosterOptions = (rosters: DRoster[]) => pipe(
  rosters,
  mapL((r) => ({
    label      : r.name!,
    value      : r.sk,
    description: r.roster_type,
  })),
);
