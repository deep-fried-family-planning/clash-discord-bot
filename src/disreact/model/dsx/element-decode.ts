// import { Rest } from '#src/disreact/codec/rest/index.ts';
// import * as FunctionElement from '../../codec/entities/function-element.ts';
// import * as IntrinsicElement from '../../codec/entities/intrinsic-element.ts';
// import * as TextElement from '../../codec/entities/text-element.ts';
//
//
//
// export const decodeSparseMessageTree = (message: IngressMessage) => {
//   const root = IntrinsicElement.make('message', {
//     ephemeral: message.flags === Rest.EPHEMERAL,
//     public   : message.flags !== Rest.EPHEMERAL,
//   });
//
//   for (const embed of message.embeds) {
//     const embedElement = IntrinsicElement.make('embed', {
//       title      : embed.title,
//       description: embed.description,
//       image      : embed.image?.url,
//     });
//   }
//
//   TextElement.make();
//
//   FunctionElement.make();
//
//   for (const component of message.components) {
//
//   }
// };
//
//
//
// export type IngressMessage = {
//   flags : number;
//   embeds: {
//     title      : string;
//     description: string;
//     image?: {
//       url?: string;
//     };
//   }[];
//   components: {
//     type      : 1;
//     components: {
//       type     : number;
//       custom_id: string;
//       value    : string;
//     }[];
//   }[];
// };
//
// export type IngressDialog = {
//   custom_id : string;
//   components: {
//     type      : 1;
//     components: [{
//       custom_id: string;
//       value    : string;
//     }];
//   }[];
// };
