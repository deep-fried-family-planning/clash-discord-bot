/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {Rest} from '#src/disreact/api/index.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {D, DT, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Duration} from 'effect';



export type Auth = D.TaggedEnum<{
  VerifiedEmail : {};
  MFA           : {};
  VerifiedMember: {};
  ServerBooster : {};
  ServerDuration: {duration: Duration.Duration};
  Custom        : {name: str};
}>;

export type VerifiedEmail = D.TaggedEnum.Value<Auth, 'VerifiedEmail'>;
export type MFA = D.TaggedEnum.Value<Auth, 'MFA'>;
export type VerifiedMember = D.TaggedEnum.Value<Auth, 'VerifiedMember'>;
export type ServerBooster = D.TaggedEnum.Value<Auth, 'ServerBooster'>;
export type ServerDuration = D.TaggedEnum.Value<Auth, 'ServerDuration'>;
export type Custom = D.TaggedEnum.Value<Auth, 'Custom'>;

export const Auth             = D.taggedEnum<Auth>();
export const VerifiedEmail    = Auth.VerifiedEmail;
export const MFA              = Auth.MFA;
export const VerifiedMember   = Auth.VerifiedMember;
export const ServerBooster    = Auth.ServerBooster;
export const ServerDuration   = Auth.ServerDuration;
export const Custom           = Auth.Custom;
export const isVerifiedEmail  = Auth.$is('VerifiedEmail');
export const isMFA            = Auth.$is('MFA');
export const isVerifiedMember = Auth.$is('VerifiedMember');
export const isServerBooster  = Auth.$is('ServerBooster');
export const isServerDuration = Auth.$is('ServerDuration');
export const isCustom         = Auth.$is('Custom');

export const requiresCustomAuth = (auths?: Auth[]) => auths?.length && !!auths.find((auth) => auth._tag === 'Custom');

export const empty = () => [] as Auth[];

export const addUserAuths = (user?: Rest.User) => (auths: Auth[]) => {
  if (user?.verified) auths.push(VerifiedEmail());
  if (user?.mfa_enabled) auths.push(MFA());
  return auths;
};

export const addMemberAuths = (member?: Rest.GuildMember) => (auths: Auth[]) => {
  if (member?.pending) auths.push(VerifiedMember());
  if (member?.premium_since) auths.push(ServerBooster());
  if (member?.joined_at) {
    auths.push(Auth.ServerDuration({
      duration: pipe(
        DT.unsafeMake(Date.now()),
        DT.distanceDuration(DT.unsafeMake(member.joined_at)),
      ),
    }));
  }
  return auths;
};

export const addAdminAuth = (server: DServer, member?: Rest.GuildMember) => (auths: Auth[]) => {
  if (member?.roles.includes(server.admin as Rest.Snowflake)) {
    auths.push(Auth.Custom({name: 'admin'}));
  }
  ;
  return auths;
};


export const isSameAuth = (a: Auth) => (b: Auth) => {
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


export const hasAllAuths = (a: Auth[], b: Auth[]) => b.every((auth) => a.find(isSameAuth(auth)));
