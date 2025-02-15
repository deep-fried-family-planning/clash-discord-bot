import type {Rest} from '#src/disreact/codec/abstract/index.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {D, DT, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Duration} from 'effect';

export type T = D.TaggedEnum<{
  VerifiedEmail : {};
  MFA           : {};
  VerifiedMember: {};
  ServerBooster : {};
  ServerDuration: {duration: Duration.Duration};
  Custom        : {name: str};
}>;

export const empty = () => [] as T[];

export const T              = D.taggedEnum<T>();
export const VerifiedEmail  = T.VerifiedEmail;
export const MFA            = T.MFA;
export const VerifiedMember = T.VerifiedMember;
export const ServerBooster  = T.ServerBooster;
export const ServerDuration = T.ServerDuration;
export const Custom         = T.Custom;

export const requiresCustomAuth = (auths?: T[]) => auths?.length && !!auths.find((auth) => auth._tag === 'Custom');

export const addUserAuths = (user?: Rest.User) => (auths: T[]) => {
  if (user?.verified) auths.push(VerifiedEmail());
  if (user?.mfa_enabled) auths.push(MFA());
  return auths;
};

export const addMemberAuths = (member?: Rest.GuildMember) => (auths: T[]) => {
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

export const addAdminAuth = (server: DServer, member?: Rest.GuildMember) => (auths: T[]) => {
  if (member?.roles.includes(server.admin as Rest.Snowflake)) {
    auths.push(T.Custom({name: 'admin'}));
  }
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

export const decodeAuths = (rest: Rest.Interaction) => pipe(
  empty(),
  addUserAuths(rest.user),
  addMemberAuths(rest.member),
);
