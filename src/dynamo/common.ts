import {S} from '#src/internal/pure/effect.ts';
import type {Brand} from 'effect';

const startsId = <T extends string>(start: string, brand: T) => S.transform(
    S.String.pipe(S.startsWith(start), S.brand(brand)),
    S.String,
    {
        strict: true,
        decode: (s) => s.replace(start, '') as string & Brand.Brand<typeof brand>,
        encode: (s) => start.concat(s) as string & Brand.Brand<typeof brand>,
    },
);

export const ServerId = startsId('s-', 'ServerId');
export const UserId = startsId('u-', 'UserId');
export const ClanTag = startsId('c-', 'ClanTag');
export const PlayerTag = startsId('p-', 'PlayerTag');
export const RosterId = startsId('r-', 'RosterId');

export const NowId = S.Literal('now');
export const ChannelId = S.String;
export const RoleId = S.String;
export const ThreadId = S.String;
export const MessageId = S.String;
export const ForumTagId = S.String;

export const ServerIdEncode = S.encodeUnknown(ServerId);
export const UserIdEncode = S.encodeUnknown(UserId);
export const ClanTagEncode = S.encodeUnknown(ClanTag);
export const PlayerTagEncode = S.encodeUnknown(PlayerTag);
export const encodeRosterId = S.encodeUnknown(RosterId);
