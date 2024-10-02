import type {DButton, IButton} from '#src/discord/helpers/re-exports.ts';
import type {DiscordMessage} from '#src/discord/types.ts';

export type HButton<T extends DButton> =
    | ((itr: IButton & {data: {custom_id: T['custom_id']}}) => Promise<DiscordMessage>);
