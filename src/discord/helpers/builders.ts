import type {APIActionRowComponent, APIActionRowComponentTypes} from '@discordjs/core';
import {CMP} from '#src/discord/helpers/re-exports.ts';

export const buildActionRow = (...components: APIActionRowComponentTypes[]) => ({
    type: CMP.ActionRow,
    components,
});
