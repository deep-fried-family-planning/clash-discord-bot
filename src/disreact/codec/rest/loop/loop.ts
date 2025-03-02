import * as Doken from '#src/disreact/codec/rest/loop/doken.ts';
import {isComponentPrefix, isDialogPrefix} from '#src/disreact/codec/rest/route/index.ts';
import * as Route from '#src/disreact/codec/rest/route/index.ts';
import {S} from '#src/internal/pure/effect.ts';
import * as Boom from '@hapi/boom';
import * as Component from '#src/disreact/codec/rest/route/component.ts';
import * as Dialog from '#src/disreact/codec/rest/route/dialog.ts';
import * as Message from '#src/disreact/codec/rest/route/message.ts';



type Injectable = {
  custom_id?: string;
  embeds?: {
    image?: {
      url?: string;
    };
  }[];
};

type Extractable = {
  message?: {
    flags? : number;
    embeds?: {
      image?: {
        url?: string;
      };
    }[];
  };
  data?: {
    component_type?: number;
    custom_id?     : string;
    components?    : any[];
  };
};

export const T = S.mutable(S.Struct({
  component: S.optional(Route.Component.T),
  dialog   : S.optional(Route.Dialog.T),
  message  : S.optional(Route.Message.T),
}));

export type T = S.Schema.Type<typeof T>;

export const inject = <A extends Injectable>(data: A, route: Route.T): A => {
  if (Component.is(route)) {
    data.custom_id = Route.Component.encode(route);
    return data;
  }

  if (Dialog.is(route)) {
    data.custom_id = Route.Dialog.encode(route);
    return data;
  }

  if (!data.embeds || !data.embeds[0]) {
    throw new Error('no embeds');
  }

  data.embeds[0].image ??= {};

  const url                = new URL('https://dffp.org');
  url.pathname             = Route.Message.encode(route);
  data.embeds[0].image.url = url.href;

  return data;
};

export const extract = <A extends Extractable>(request: A): T => {
  const acc = {} as T;

  if (!request.data?.custom_id) {
    throw new Error('No Implementation');
  }

  if (isComponentPrefix(request.data.custom_id)) {
    acc.component = Route.Component.decode(request.data.custom_id);
  }

  if (isDialogPrefix(request.data.custom_id)) {
    acc.dialog = Route.Dialog.decode(request.data.custom_id);
  }

  if (!request.message?.embeds?.[0]?.image?.url) {
    if (acc.component && !acc.component.root_id) {
      throw Boom.badImplementation('component route must have root_id when message route is not present');
    }

    if (acc.dialog && !acc.dialog.root_id) {
      throw Boom.badImplementation('dialog route must have root_id when message route is not present');
    }

    return acc;
  }

  const encoded = new URL(request.message.embeds[0].image.url).pathname.slice(1);
  const decoded = Message.decode(encoded);

  acc.message = request.message.flags !== 64
    ? decoded
    : {
      ...decoded,
      ephemeral: Doken.EPHEMERAL,
    };

  return acc;
};

export const getFirstRootId = (loop: T): string => {
  if (loop.dialog) {
    return loop.dialog.root_id;
  }
  if (loop.message) {
    return loop.message.root_id;
  }
  return loop.component!.root_id!;
};
