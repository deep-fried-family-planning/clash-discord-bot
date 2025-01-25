import {D, E, g, pipe} from '#pure/effect';
import {inspect} from 'node:util';
import {Cm, Co, DA, Df, Em, Ev} from '#src/internal/disreact/virtual/entities/index.ts';
import {NONE} from '#src/internal/disreact/virtual/kinds/constants.ts';
import {Auth, Err} from '#src/internal/disreact/virtual/kinds/index.ts';
import {ComponentRoute, DialogRoute, MainRoute} from '#disreact/runtime/route/index.ts';
import type {num, obj, str} from '#src/internal/pure/types-pure.ts';



export type Common = {
  app_id        : str;
  curr_id       : str;
  curr_token    : str;
  prev_ephemeral: boolean;
  prev_id       : str;
  prev_active   : num;
  prev_defer    : Df.T;

  rest  : DA.Ix;
  user  : DA.User;
  member: DA.GuildMember;
  guild : DA.Guild;
  roles : str[];
  auths : Auth.T[];

  routes: {
    registry : URLSearchParams;
    main     : MainRoute.T;
    target   : ComponentRoute.T;
    dialog   : DialogRoute.T;
    root_name: str;
    node_name: str;
  };
};


export type T = D.TaggedEnum<{
  None  : obj;
  Click : Common & {container: Co.Message; event: Ev.Click};
  Submit: Common & {container: Co.Dialog; event: Ev.Submit};
}>;


export type None = D.TaggedEnum.Value<T, 'None'>;
export type Click = D.TaggedEnum.Value<T, 'Click'>;
export type Submit = D.TaggedEnum.Value<T, 'Submit'>;


const T             = D.taggedEnum<T>();
export const None   = T.None() as T;
export const Click  = T.Click;
export const Submit = T.Submit;

export const isNone   = T.$is('None');
export const isClick  = T.$is('Click');
export const isSubmit = T.$is('Submit');


export const decodeInteraction = (rest: DA.Ix) => g(function * () {
  if (rest.type === DA.En.Ix.PING) return yield * new Err.NotImplemented();
  if (rest.type === DA.En.Ix.APPLICATION_COMMAND_AUTOCOMPLETE) return yield * new Err.NotImplemented();
  if (rest.type === DA.En.Ix.APPLICATION_COMMAND) return yield * new Err.NotImplemented();

  yield * E.logDebug('id', rest.id);
  yield * E.logDebug('token', rest.token);
  yield * E.logDebug('data.custom_id', rest.data.custom_id);

  const auths = pipe(
    Auth.empty(),
    Auth.addUserAuths(rest.user),
    Auth.addMemberAuths(rest.member),
  );

  if (rest.type === DA.En.Ix.MODAL_SUBMIT) {
    const dialog = DialogRoute.decode(rest.data.custom_id)!;

    return Submit({
      app_id        : rest.application_id,
      curr_id       : rest.id,
      curr_token    : rest.token,
      prev_id       : dialog.params.id,
      prev_active   : 0,
      prev_ephemeral: true,
      prev_defer    : Df.decodeDefer(dialog.params.defer),

      rest  : rest,
      user  : rest.user!,
      member: rest.member!,
      guild : rest.guild!,
      roles : rest.member?.roles ?? [],
      auths,

      routes: {
        registry : new URLSearchParams(),
        main     : MainRoute.empty(),
        target   : ComponentRoute.empty(),
        dialog,
        root_name: dialog.params.root,
        node_name: dialog.params.node,
      },

      container: Co.Dialog({
        custom_id : rest.data.custom_id!,
        title     : NONE,
        components: Cm.decodeDialogComponents(rest),
      }),

      event: Ev.Submit(),
    });
  }

  const main   = MainRoute.decodeFromMainEmbed(rest);
  const target = ComponentRoute.decode(rest.data.custom_id)!;

  const container = Co.Message({
    embeds    : Em.decodeAll(rest.message?.embeds),
    components: Cm.decodeMessageComponents(rest),
  });

  yield * E.logDebug('container', inspect(container, false, null, true));

  const component = container.components.flat().find((c) => (c.data.custom_id === rest.data.custom_id));

  if (!component) {
    return yield * new Err.ComponentUnknownError();
  }

  return Click({
    app_id        : rest.application_id,
    curr_id       : rest.id,
    curr_token    : rest.token,
    prev_id       : NONE,
    prev_active   : 0,
    prev_ephemeral: rest.message?.flags === DA.En.MF.EPHEMERAL,
    prev_defer    : Df.decodeDefer(main.params.defer),

    rest  : rest,
    user  : rest.user!,
    member: rest.member!,
    guild : rest.guild!,
    roles : rest.member?.roles ?? [],
    auths,

    routes: {
      registry : main.query!,
      main     : main,
      target   : target,
      dialog   : DialogRoute.empty(),
      root_name: main.params.root,
      node_name: main.params.node,
    },

    container: Co.Message({
      embeds    : Em.decodeAll(rest.message?.embeds),
      components: Cm.decodeMessageComponents(rest),
    }),

    event: Ev.Click({
      row     : parseInt(target.params.row),
      col     : parseInt(target.params.col),
      target  : component.data,
      values  : [], // todo
      resolved: rest.data.resolved!,
    }),
  });
});
