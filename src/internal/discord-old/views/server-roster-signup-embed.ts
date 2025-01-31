import {dCodes, dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {dTable} from '#src/internal/discord-old/util/message-table.ts';
import type {DRosterSignup} from '#src/dynamo/schema/discord-roster-signup.ts';
import type {DRoster} from '#src/dynamo/schema/discord-roster.ts';
import {DT, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {mapL, sortByL} from '#src/internal/pure/pure-list.ts';
import type {Player} from 'clashofclans.js';



export const viewServerRosterSignupEmbed = (
  roster: DRoster,
  signups: [string, DRosterSignup['accounts'][string]][],
  ps: Player[],
) => {
  const players = pipe(
    ps,
    sortByL(
      ORD.mapInput(ORDNR, (p) => p.townHallLevel),
    ),
  );

  const signupsWithPlayers = pipe(
    signups,
    sortByL(
      ORD.mapInput(ORDS, ([tag]) => tag),
    ),
    mapL(([tag, rounds], idx) => [tag, rounds, players[idx]] as const),
    sortByL(
      ORD.mapInput(ORDS, ([tag]) => tag),
    ),
  );

  return {
    title      : roster.name!,
    description: dCodes(
      dTable([
        ['##', 'th', 'name', '1234567'],
        ...pipe(
          signupsWithPlayers,
          mapL(([tag, rounds, player], idx) => [
            `${idx}`,
            `${player.townHallLevel}`,
            player.name,
            rounds.map((r) => r.availability ? r.designation === 'default' ? 'x' : 'd' : '_').join(''),
          ]),
        ),
      ]),
    ).join('\n'),

    timestamp: pipe(
      roster.search_time,
      DT.withDateUtc((d) => d.toISOString()),
    ),

    footer: {
      text: dLinesS(
        'x - default attack group',
        'd - designated 2 star',
        '_ - unavailable for round',
        '',
      ),
    },
  };
};
