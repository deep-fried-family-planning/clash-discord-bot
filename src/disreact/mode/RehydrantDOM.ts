import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Mailbox from 'effect/Mailbox';

export type Progress = Data.TaggedEnum<{
  Start: {};
  Close: {};
  Same : {};
  Next : {id: string | null; props?: any};
  Part : {type: 'modal' | 'message' | 'ephemeral'; isEphemeral?: boolean};
  Done : {};
}>;
export const Progress = Data.taggedEnum<Progress>();

export class RehydrantDOM extends E.Service<RehydrantDOM>()('disreact/RehydrantDOM', {
  effect: E.gen(function* () {
    const mailbox = yield* Mailbox.make();

    return {

    };
  }),
  accessors: true,
}) {}
