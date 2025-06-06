// import type {Discord} from 'dfx';
// import * as Array from 'effect/Array';
// import {pipe} from 'effect/Function';
// import * as Record from 'effect/Record';
//
// type MessageComponentMap = Record<string, Extract<Discord.AllComponents,
//   | Discord.ButtonComponentResponse
//   | Discord.StringSelectComponentResponse
//   | Discord.ChannelSelectComponentResponse
//   | Discord.MentionableSelectComponentResponse
//   | Discord.RoleSelectComponentResponse
//   | Discord.UserSelectComponentResponse
// >>;
//
// export const componentCustomIdMap = (components: any): MessageComponentMap =>
//   pipe(
//     Array.flatMap(components, (c) => c.components),
//     Array.filter((c) => c.custom_id),
//     Record.fromIterableWith((c) => [c.custom_id, c]),
//   );
//
// type ModalComponentMap = Record<string, Extract<Discord.AllComponents,
//   Discord.TextInputComponentResponse
// >>;
//
// export const textInputCustomIdMap = (components: any): ModalComponentMap =>
//   componentCustomIdMap(components) as ModalComponentMap;
