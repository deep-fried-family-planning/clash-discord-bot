/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {ForbiddenSync} from '#src/disreact/codec/wire/shared/shared.ts';
import {pipe} from 'effect';
import {String, Struct, TaggedStruct, transform, Union} from 'effect/Schema';
import {DAPI, Doken, Ix, Params} from 'src/disreact/codec/wire/index.ts';
import * as DAPIOld from 'src/disreact/codec/wire/dapi.ts';



export const COMPONENT       = 'Component' as const;
export const COMMAND_MODAL   = 'CommandModal' as const;
export const COMPONENT_MODAL = 'ModalMessage' as const;

export const Component = TaggedStruct(COMPONENT, {
  request  : Ix.ComponentRequest,
  dokens   : Doken.Dokens,
  custom_id: String,
  root_id  : String,
  hash     : String,
});

export const ComponentModal = TaggedStruct(COMPONENT_MODAL, {
  request  : Ix.ModalRequest,
  dokens   : Doken.Dokens,
  custom_id: String,
  modal_id : String,
  root_id  : String,
  hash     : String,
});

export const CommandModal = TaggedStruct(COMMAND_MODAL, {
  request  : Ix.ModalRequest,
  dokens   : Doken.Dokens,
  custom_id: String,
});

export const Input = Union(
  Component,
  ComponentModal,
);



export const ComponentIntermediate = Struct({
  request: Ix.ComponentRequest,
  fresh  : Doken.FreshFromRequest,
  hydra  : Params.HydrationFromRequest,
});

export const ComponentFromRequest = pipe(
  DAPIOld.ComponentRequest,
  transform(
    ComponentIntermediate,
    {
      strict: true,
      decode: (request, r2) =>
        ({
          request,
          fresh: request,
          hydra: request,
        }),
      encode: ForbiddenSync,
    },
  ),
  transform(
    Component,
    {
      strict: true,
      decode: ({request, fresh, hydra}) =>
        ({
          _tag     : COMPONENT,
          request  : request,
          custom_id: request.data.custom_id,
          root_id  : hydra.params.root_id,
          hash     : hydra.params.hash,
          dokens   : {
            fresh,
            defer: hydra.params.doken,
          },
        }),
      encode: ForbiddenSync,
    },
  ),
);



export const ModalMessageIntermediate = Struct({
  request: Ix.ModalRequest,
  fresh  : Doken.FreshFromRequest,
  modal  : Params.ModalFromRequest,
  hydra  : Params.HydrationFromRequest,
});

export const ModalMessageFromRequest = pipe(
  DAPI.ModalRequest,
  transform(
    ModalMessageIntermediate,
    {
      strict: true,
      decode: (request) =>
        ({
          request,
          fresh: request,
          modal: request,
          hydra: request,
        }),
      encode: ForbiddenSync,
    },
  ),
  transform(
    ComponentModal,
    {
      strict: true,
      decode: ({request, fresh, modal, hydra}) =>
        ({
          _tag     : COMPONENT_MODAL,
          request  : request,
          custom_id: modal.custom_id,
          modal_id : modal.root_id,
          root_id  : hydra.params.root_id,
          hash     : hydra.params.hash,
          dokens   : {
            fresh,
            defer: hydra.params.doken,
          },
        }),
      encode: ForbiddenSync,
    },
  ),
);



export const Rx = Union(
  ComponentFromRequest,
  ModalMessageFromRequest,
);



export type Component = typeof Component.Type;
export type ModalMessage = typeof ComponentModal.Type;
export type Input = typeof Input.Type;
