import {__DISREACT_NONE} from '#src/disreact/api/constants.ts';
import {Defer} from '#src/disreact/api/index.ts';
import {Auth, Err, Rest, Token} from '#src/disreact/api/index.ts';
import type {HookStates} from '#src/disreact/model/hooks/hook-state.ts';
import {D, E, pipe} from '#src/internal/pure/effect.ts';



type Common = {
  rest : Rest.Interaction;
  auths: Auth.Auth[];
  token: Token.Token;
  defer: Defer.Defer;
  route: {
    token: Token.Token;
    root : string;
    node : string;
  };
};

export type Ix = D.TaggedEnum<{
  Command: Common & {};
  Click  : Common & {states: HookStates};
  Submit : Common & {};
}>;

export type Command = D.TaggedEnum.Value<Ix, 'Command'>;
export type Click = D.TaggedEnum.Value<Ix, 'Click'>;
export type Submit = D.TaggedEnum.Value<Ix, 'Submit'>;

export const Ix        = D.taggedEnum<Ix>();
export const Command   = Ix.Command;
export const Click     = Ix.Click;
export const Submit    = Ix.Submit;
export const isCommand = Ix.$is('Command');
export const isClick   = Ix.$is('Click');
export const isSubmit  = Ix.$is('Submit');

const decodeMessageComponent = (rest: Rest.Interaction) => E.gen(function * () {
  const auths = pipe(
    Auth.empty(),
    Auth.addUserAuths(rest.user),
    Auth.addMemberAuths(rest.member),
  );

  if (!rest.message) return yield * new Err.Critical();

  return Click({
    rest,
    auths,
    token: Token.make(rest),
    defer: Defer.None(),
    route: {
      root: __DISREACT_NONE,
      node: __DISREACT_NONE,
    },
  });
});

const decodeModalSubmit = (rest: Rest.Interaction) => E.gen(function * () {
  const auths = pipe(
    Auth.empty(),
    Auth.addUserAuths(rest.user),
    Auth.addMemberAuths(rest.member),
  );

  return Submit({
    rest,
    auths,
    token: Token.make(rest),
    defer: Defer.None(),
    route: {
      root: __DISREACT_NONE,
      node: __DISREACT_NONE,
    },
  });
});

export const decodeInteraction = (rest: Rest.Interaction) => E.gen(function * () {
  switch (rest.type) {
    case Rest.InteractionType.MODAL_SUBMIT:
      return yield * decodeModalSubmit(rest);

    case Rest.InteractionType.MESSAGE_COMPONENT:
      return yield * decodeMessageComponent(rest);

    case Rest.InteractionType.PING:
    case Rest.InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
    case Rest.InteractionType.APPLICATION_COMMAND:
    default:
      return yield * new Err.Critical();
  }
});
