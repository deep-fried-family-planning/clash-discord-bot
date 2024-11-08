import type * as D from 'dfx/types';
import type {CommandSpec, Interaction, OptionData} from '#src/aws-lambdas/menu/old/types.ts';
import type {Effect} from 'effect';
import type {CID} from '#src/data/types.ts';
import type {bool, int} from '#src/pure/types-pure.ts';

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

export type CmdOps<T extends CommandSpec> = OptionData<T['options']>;

export type SharedOptions = {
    cid1 : CID;
    cid2?: CID;

    limit: int;
    from : int;
    to   : int;

    showCurrent: bool;
    showN      : bool;
    exhaustive : bool;
};
