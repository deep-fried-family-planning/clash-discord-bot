// import {Rest} from '#src/disreact/codec/abstract/index.ts';
// import {pipe, S} from '#src/internal/pure/effect.ts';
// import {DateTime, Record} from 'effect';
//
// export const RootId = S.String;
// export const Ephem = S.transformLiterals(['0', false], ['1', true]);
// export const DokenType = S.Literal(...Record.values(Rest.Tx).filter(Number.isInteger));
// export const DokenValue = S.StringFromBase64Url;
//
// export const DokenTTL = pipe(
//   S.String,
//   S.transform(S.DateTimeUtcFromNumber, {
//     encode: (millis) => {
//       // const uint8 = ;
//       // new DataView(uint8.buffer).setFloat64(0, millis, false);
//       const buffer = Buffer.from(new Uint8Array(8));
//       buffer.writeDoubleBE(millis);
//       return buffer.toString('base64url');
//     },
//     decode: (str) => {
//       return Buffer.from(str.padEnd(8, '0'), 'base64url').readDoubleBE();
//     },
//   }),
// );
//
// export const DokenId = S.String;
//
//
//
// export const PathParamParser = S.transform(
//   S.URL,
//   S.TemplateLiteralParser(
//     '/m/', RootId, '/', Ephem, DokenType, '/', DokenId, '/', DokenTTL, '/', DokenValue,
//   ),
//   {
//     encode: (params) => {
//       const url = new URL('https://dffp.org');
//       url.pathname = params;
//       return url;
//     },
//     decode: (url) => {
//       return url.pathname as any;
//     },
//   },
// );
//
//
//
// const PathParamDecoder = S.encodeUnknownSync(PathParamParser);
// const PathParamEncoder = S.decodeSync(PathParamParser);
//
//
// export const decodePath = (str: string) => {
//
// };
//
// const dat = DateTime.unsafeNow();
// console.log(dat.epochMillis);
// const enc = S.encodeUnknownSync(DokenTTL)(dat);
// console.log(enc);
// const dec = S.decodeUnknownSync(DokenTTL)(enc);
// console.log(dec);
// const dat2 = DateTime.unsafeNow();
// console.log(dat2);
//
//
//
// import type {Rest} from '#src/disreact/codec/abstract/index.ts';
// import type {DServer} from '#src/dynamo/schema/discord-server.ts';
// import {D, DT, pipe} from '#src/internal/pure/effect.ts';
// import type {str} from '#src/internal/pure/types-pure.ts';
// import {Duration} from 'effect';
//
// export type T = D.TaggedEnum<{
//   VerifiedEmail : {};
//   MFA           : {};
//   VerifiedMember: {};
//   ServerBooster : {};
//   ServerDuration: {duration: Duration.Duration};
//   Custom        : {name: str};
// }>;
//
// export const empty = () => [] as T[];
//
// export const T              = D.taggedEnum<T>();
// export const VerifiedEmail  = T.VerifiedEmail;
// export const MFA            = T.MFA;
// export const VerifiedMember = T.VerifiedMember;
// export const ServerBooster  = T.ServerBooster;
// export const ServerDuration = T.ServerDuration;
// export const Custom         = T.Custom;
//
// export const requiresCustomAuth = (auths?: T[]) => auths?.length && !!auths.find((auth) => auth._tag === 'Custom');
//
// export const addUserAuths = (user?: Rest.User) => (auths: T[]) => {
//   if (user?.verified) auths.push(VerifiedEmail());
//   if (user?.mfa_enabled) auths.push(MFA());
//   return auths;
// };
//
// export const addMemberAuths = (member?: Rest.GuildMember) => (auths: T[]) => {
//   if (member?.pending) auths.push(VerifiedMember());
//   if (member?.premium_since) auths.push(ServerBooster());
//   if (member?.joined_at) {
//     auths.push(T.ServerDuration({
//       duration: pipe(
//         DT.unsafeMake(Date.now()),
//         DT.distanceDuration(DT.unsafeMake(member.joined_at)),
//       ),
//     }));
//   }
//   return auths;
// };
//
// export const addAdminAuth = (server: DServer, member?: Rest.GuildMember) => (auths: T[]) => {
//   if (member?.roles.includes(server.admin as Rest.Snowflake)) {
//     auths.push(T.Custom({name: 'admin'}));
//   }
//   return auths;
// };
//
// export const isSameAuth = (a: T) => (b: T) => {
//   if (a._tag === 'ServerDuration' && b._tag === 'ServerDuration') {
//     return pipe(
//       a.duration,
//       Duration.greaterThanOrEqualTo(b.duration),
//     );
//   }
//
//   if (a._tag === 'Custom' && b._tag === 'Custom') {
//     return a.name === b.name;
//   }
//
//   return a._tag === b._tag;
// };
//
// export const hasAllAuths = (a: T[], b: T[]) => b.every((auth) => a.find(isSameAuth(auth)));
//
// export const decodeAuths = (rest: Rest.Interaction) => pipe(
//   empty(),
//   addUserAuths(rest.user),
//   addMemberAuths(rest.member),
// );
