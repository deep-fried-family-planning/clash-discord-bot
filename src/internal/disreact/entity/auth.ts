import {D, DT, pipe} from '#pure/effect';
import type {snow} from '#src/discord/types.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {Auth} from '#src/internal/disreact/entity/index.ts';
import type {obj, str} from '#src/internal/pure/types-pure.ts';
import type {GuildMember, User} from 'dfx/types';
import {Duration} from 'effect';


export type T = D.TaggedEnum<{
  VerifiedEmail : obj;
  MFA           : obj;
  VerifiedMember: obj;
  ServerBooster : obj;
  ServerDuration: {duration: Duration.Duration};
  Custom        : {name: str};
}>;


export const T = D.taggedEnum<T>();


export const requiresCustomAuth = (auths?: T[]) => auths?.length && !!auths.find((auth) => auth._tag === 'Custom');


export const addUserAuths = (user?: User) => (auths: T[]) => {
  if (user?.verified) auths.push(Auth.T.VerifiedEmail());
  if (user?.mfa_enabled) auths.push(Auth.T.MFA());
  return auths;
};


export const addMemberAuths = (member?: GuildMember) => (auths: T[]) => {
  if (member?.pending) auths.push(T.VerifiedMember());
  if (member?.premium_since) auths.push(T.ServerBooster());
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
  if (member?.roles.includes(server.admin as snow)) auths.push(Auth.T.Custom({name: 'admin'}));
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
