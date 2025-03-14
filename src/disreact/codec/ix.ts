import {Redaction, RedactionTerminus} from '#src/disreact/codec/wire/shared/shared.ts';
import {RedactedFromSelf, Redacted, Struct, transform, String, optional, Union} from 'effect/Schema';
import * as DAPI from '#src/disreact/codec/wire/dapi.ts';
import * as Params from '#src/disreact/codec/wire/abstract/hydrator.ts';



export const BaseRequest = Struct({
  ...DAPI.BaseRequest.fields,
  token         : Redaction,
  application_id: Redaction,
  user_id       : Redaction,
  guild_id      : optional(Redaction),
});

export const ComponentRequest = Struct({
  ...DAPI.ComponentRequest.fields,
  ...BaseRequest.fields,
});

export const ComponentModalRequest = Struct({
  ...DAPI.ModalRequest.fields,

});

export const ModalRequest = Struct({
  ...DAPI.ModalRequest.fields,
  ...BaseRequest.fields,
});

export const InteractionRequest = Union(
  ComponentRequest,
  ModalRequest,
);



export const ComponentRoute = Struct({
  route: Params.Component,
  data : DAPI.ComponentData,
});

export const ModalRoute = Struct({
  route: Params.Modal,
  modal: DAPI.Modal,
});

export const MessageRoute = Struct({
  route  : Params.Hydration,
  message: DAPI.BaseMessage,
});


// export const RX_COMPONENT = 'RxComponent' as const;
//
// export const RxComponent = TaggedStruct(RX_COMPONENT, {
//   request  : DAPI.ComponentRequest,
//   custom_id: String,
//   root_id  : String,
//   fresh    : Doken.FreshFromRequest,
//   doken    : Doken.DeferOrUndefinedFromAny,
//
// });
//
//
//
// export const COMPONENT_TAG    = 'Component';
// export const MODAL_SUBMIT_TAG = 'ModalSubmit';
//
// export const ComponentInput = transform(
//   DAPI.ComponentRequest,
//   TaggedStruct(COMPONENT_TAG, {
//     request: DAPI.ComponentRequest,
//     root_id: FiberRoot.S.RootId,
//     fresh  : mutable(Doken.S.FreshFromRequest),
//     url    : optional(Parse.HydrationUrlExtraction),
//   }),
//   {
//     strict: false,
//     decode: (a) =>
//       ({
//         _tag   : COMPONENT_TAG,
//         request: a,
//         fresh  : a,
//         url    : a.message,
//       }),
//     encode: () => ParseResult.Forbidden,
//   },
// );
//
// export const ModalInput = transform(
//   DAPI.ModalRequest,
//   TaggedStruct(MODAL_SUBMIT_TAG, {
//     request: DAPI.ModalRequest,
//     root_id: FiberRoot.S.RootId,
//     fresh  : mutable(Doken.S.FreshFromRequest),
//     url    : optional(Parse.HydrationUrlExtraction),
//   }),
//   {
//     strict: false,
//     decode: (a) =>
//       ({
//         _tag   : MODAL_SUBMIT_TAG,
//         request: a,
//         fresh  : a,
//         url    : a.message,
//       }),
//     encode: () => ParseResult.Forbidden,
//   },
// );
//
// export const Ix = Union(
//   ComponentInput,
//   ModalInput,
// );
//
// export const ModalOutput = transform(
//   DAPI.CallbackModal,
//   Struct({
//     params: Parse.ModalFromString,
//     ...DAPI.CallbackModal.fields,
//   }),
//   {
//     strict: false,
//     decode: () => {throw new Error()},
//     encode: (a) =>
//       ({
//         type: a.type,
//         data: {
//           ...a.data,
//           custom_id: a.params,
//         },
//       }),
//   },
// );
//
// export const EditMessageOutput = transform(
//   DAPI.EditResponse,
//   transform(
//     Struct({
//       id    : String,
//       app_id: String,
//       token : String,
//       data  : Parse.HydrationUrlInjection,
//     }),
//     Struct({
//       app_id: String,
//       params: Parse.HydrationUrl,
//       data  : DAPI.Message,
//     }),
//     {
//       strict: true,
//       decode: () => {throw ''},
//       encode: (a) =>
//         ({
//           id    : a.params.doken.id,
//           app_id: a.app_id,
//           token : a.params.doken.val,
//           data  : {
//             params : a.params,
//             message: a.data,
//           },
//         }),
//     },
//   ),
//   {
//     strict: true,
//     decode: () => {throw new Error()},
//     encode: (a) =>
//       ({
//         id    : a.id,
//         app_id: a.app_id,
//         token : a.token,
//         data  : a.data,
//       }),
//   },
// );
