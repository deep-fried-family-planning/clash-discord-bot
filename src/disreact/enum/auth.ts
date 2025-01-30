/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {Rest} from '#src/disreact/enum/index.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {D, DT, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Duration} from 'effect';

export type TAuth = D.TaggedEnum<{
  VerifiedEmail : {};
  MFA           : {};
  VerifiedMember: {};
  ServerBooster : {};
  ServerDuration: {duration: Duration.Duration};
  Custom        : {name: str};
}>;

export const empty = () => [] as TAuth[];

export const Auth             = D.taggedEnum<TAuth>();
export const VerifiedEmail    = Auth.VerifiedEmail;
export const MFA              = Auth.MFA;
export const VerifiedMember   = Auth.VerifiedMember;
export const ServerBooster    = Auth.ServerBooster;
export const ServerDuration   = Auth.ServerDuration;
export const Custom           = Auth.Custom;

export const requiresCustomAuth = (auths?: TAuth[]) => auths?.length && !!auths.find((auth) => auth._tag === 'Custom');

export const addUserAuths = (user?: Rest.User) => (auths: TAuth[]) => {
  if (user?.verified) auths.push(VerifiedEmail());
  if (user?.mfa_enabled) auths.push(MFA());
  return auths;
};

export const addMemberAuths = (member?: Rest.GuildMember) => (auths: TAuth[]) => {
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

export const addAdminAuth = (server: DServer, member?: Rest.GuildMember) => (auths: TAuth[]) => {
  if (member?.roles.includes(server.admin as Rest.Snowflake)) {
    auths.push(Auth.Custom({name: 'admin'}));
  }
  return auths;
};

export const isSameAuth = (a: TAuth) => (b: TAuth) => {
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

export const hasAllAuths = (a: TAuth[], b: TAuth[]) => b.every((auth) => a.find(isSameAuth(auth)));

export const decodeAuths = (rest: Rest.Interaction) => pipe(
  empty(),
  addUserAuths(rest.user),
  addMemberAuths(rest.member),
);
