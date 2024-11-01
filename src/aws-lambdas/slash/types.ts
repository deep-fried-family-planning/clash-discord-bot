import type * as D from 'dfx/types';
import type {CommandSpec, Interaction, OptionData} from '#src/discord/types.ts';
import type {Effect} from 'effect';
import type {TaggedException} from '@effect-aws/client-dynamodb/lib/Errors';

type Eff<A, E, R> = Effect.Effect<A, E, R>;

export type Ret = Partial<D.EditWebhookMessageParams>;

type Helper<Effect> = Effect extends Eff<infer A, infer E, infer R>
    ? Eff<A, E, R>
    : never;

export type CmdFn<
    T extends CommandSpec,
> = () => <
    E,
> (data: Interaction, options: OptionData<T['options']>) => Helper<E>;
