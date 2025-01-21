import {D, DT, pipe} from '#pure/effect';
import type {snow} from '#src/discord/types.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import type {DA} from '#src/internal/disreact/virtual/entities/index.ts';
import {Auth} from '#src/internal/disreact/virtual/kinds/index.ts';
import type {obj, str} from '#src/internal/pure/types-pure.ts';
import type {GuildMember} from 'dfx/types';
import {Duration} from 'effect';


export type T = D.TaggedEnum<{
  VerifiedEmail : obj;
  MFA           : obj;
  VerifiedMember: obj;
  ServerBooster : obj;
  ServerDuration: {duration: Duration.Duration};
  Custom        : {name: str};
}>;

export type VerifiedEmail = D.TaggedEnum.Value<T, 'VerifiedEmail'>;
export type MFA = D.TaggedEnum.Value<T, 'MFA'>;
export type VerifiedMember = D.TaggedEnum.Value<T, 'VerifiedMember'>;
export type ServerBooster = D.TaggedEnum.Value<T, 'ServerBooster'>;
export type ServerDuration = D.TaggedEnum.Value<T, 'ServerDuration'>;
export type Custom = D.TaggedEnum.Value<T, 'Custom'>;

export const T = D.taggedEnum<T>();

export const VerifiedEmail = T.VerifiedEmail;
export const MFA = T.MFA;
export const VerifiedMember = T.VerifiedMember;
export const ServerBooster = T.ServerBooster;
export const ServerDuration = T.ServerDuration;
export const Custom = T.Custom;

export const isVerifiedEmail = T.$is('VerifiedEmail');
export const isMFA = T.$is('MFA');
export const isVerifiedMember = T.$is('VerifiedMember');
export const isServerBooster = T.$is('ServerBooster');
export const isServerDuration = T.$is('ServerDuration');
export const isCustom = T.$is('Custom');

export const requiresCustomAuth = (auths?: T[]) => auths?.length && !!auths.find((auth) => auth._tag === 'Custom');


export const empty = () => [] as T[];

export const addUserAuths = (user?: DA.User) => (auths: T[]) => {
  if (user?.verified) auths.push(Auth.VerifiedEmail());
  if (user?.mfa_enabled) auths.push(Auth.MFA());
  return auths;
};


export const addMemberAuths = (member?: GuildMember) => (auths: T[]) => {
  if (member?.pending) auths.push(VerifiedMember());
  if (member?.premium_since) auths.push(ServerBooster());
  if (member?.joined_at) {
    auths.push(T.ServerDuration({
      duration: pipe(
        DT.unsafeMake(Date.now()),
        DT.distanceDuration(DT.unsafeMake(member.joined_at)),
      ),
    }));
  }
  return auths;
};


export const addAdminAuth = (server: DServer, member?: GuildMember) => (auths: T[]) => {
  if (member?.roles.includes(server.admin as snow)) auths.push(Auth.Custom({name: 'admin'}));
  return auths;
};


export const isSameAuth = (a: T) => (b: T) => {
  if (a._tag === 'ServerDuration' && b._tag === 'ServerDuration') {
    return pipe(
      a.duration,
      Duration.greaterThanOrEqualTo(b.duration),
    );
  }

  if (a._tag === 'Custom' && b._tag === 'Custom') {
    return a.name === b.name;
  }

  return a._tag === b._tag;
};


export const hasAllAuths = (a: T[], b: T[]) => b.every((auth) => a.find(isSameAuth(auth)));
