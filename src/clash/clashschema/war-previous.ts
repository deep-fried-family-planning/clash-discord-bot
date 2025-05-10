import { S } from '#src/internal/pure/effect';
import {decodeUnknownSync} from 'effect/Schema';


export const previous = S.Struct({
  state                : S.String,
  teamSize             : S.Int,
  attacksPerMember     : S.Int,
  battleModifier       : S.String,
  preparationsStartTime: S.DateTimeUtc,
  startTime            : S.DateTimeUtc,
  endTime              : S.DateTimeUtc,
  clan                 : S.Struct({
      tag      : S.String,
      name     : S.String,
      badgeUrls: S.Struct({
      small : S.String,
      large : S.String,
      medium: S.String,
    }),
  }),
  clanLevel            : S.Int,
  attacks              : S.Int,
  stars                : S.Int,
  destructionPercentage: S.Int,
  members              : S.Array(
    S.Struct({
        tag          : S.String,
      name         : S.String,
      townhallLevel: S.Int,
      mapPosition  : S.Int,
      attacks      : S.Array(
        S.Struct({
          attackerTag          : S.String,
          defenderTag          : S.String,
          stars                : S.Int,
          destructionPercentage: S.Int,
          order                : S.Int,
          duration             : S.Int,
        }),
      ),
      opponentAttacks   : S.Int,
      bestOpponentAttack: S.Struct({
        attackerTag          : S.String,
        defenderTag          : S.String,
        stars                : S.Int,
        destructionPercentage: S.Int,
        order                : S.Int,
        duration             : S.Int,
      }),
    }),
  ),
  status_code    : S.Int,
  timestamp      : S.DateTimeUtcFromNumber,
  _response_retry: S.Int,
});

const decoder = decodeUnknownSync(previous);
console.log(decoder({
  state                : 'warEnded',
  teamSize             : 35,
  attacksPerMember     : 2,
  battleModifier       : 'none',
  preparationsStartTime: '20250429T092646.000Z',
  startTime            : '20250430T082646.000Z',
  endTime              : '20250501T082646.000Z',
  clan                 : {
  tag      : '#2GR2G0PGG',
    name     : 'DFFP',
    badgeUrls: {
    small : 'https://api-assets.clashofclans.com/badges/70/pE_V18dUS3FdyCFhaGOHLAyyy4FWGEYeYKnEX9GqvJY.png',
      large : 'https://api-assets.clashofclans.com/badges/512/pE_V18dUS3FdyCFhaGOHLAyyy4FWGEYeYKnEX9GqvJY.png',
      medium: 'https://api-assets.clashofclans.com/badges/200/pE_V18dUS3FdyCFhaGOHLAyyy4FWGEYeYKnEX9GqvJY.png',
  },
  clanLevel            : 17,
    attacks              : 49,
    stars                : 91,
    destructionPercentage: 87.8,
    members              : [
    {
      tag          : '#Y82Q9Q98',
      name         : 'Kronith',
      townhallLevel: 17,
      mapPosition  : 4,
      attacks      : [
        {
          attackerTag          : '#Y82Q9Q98',
          defenderTag          : '#90QVYGCVC',
          stars                : 3,
          destructionPercentage: 100,
          order                : 64,
          duration             : 142,
        },
        {
          attackerTag          : '#Y82Q9Q98',
          defenderTag          : '#QRCRRPQ82',
          stars                : 3,
          destructionPercentage: 100,
          order                : 66,
          duration             : 136,
        },
      ],
      opponentAttacks   : 2,
      bestOpponentAttack: {
        attackerTag          : '#QCYY8PJRV',
        defenderTag          : '#Y82Q9Q98',
        stars                : 3,
        destructionPercentage: 100,
        order                : 4,
        duration             : 76,
      },
    },
  ],
},
  status_code    : 200,
  timestamp      : 1746088126.215723,
  _response_retry: 48,

}));
