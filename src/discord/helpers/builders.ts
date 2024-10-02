import type {APIActionRowComponent, APIActionRowComponentTypes} from 'discord-api-types/v10';
import {CMP} from '#src/discord/helpers/re-exports.ts';

export const buildActionRow = (...components: APIActionRowComponentTypes[]) => ({
    type: CMP.ActionRow,
    components,
});
