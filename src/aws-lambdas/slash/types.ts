import type * as D from 'dfx/types';
import type {CommandSpec, Interaction, OptionData} from '#src/discord/types.ts';
import type {Effect} from 'effect';

export type CmdFn<T extends CommandSpec> = <E = never, R = never>(data: Interaction, options: OptionData<T['options']>) => Effect.Effect<Partial<D.EditWebhookMessageParams>, E, R>;
