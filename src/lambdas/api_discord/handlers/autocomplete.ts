import type {APIApplicationCommandAutocompleteInteraction} from 'discord-api-types/v10';
import {respond} from '#src/lambdas/api_discord/api-util.ts';

export const autocomplete = (body: APIApplicationCommandAutocompleteInteraction) => respond({
    status: 200,
    body  : {},
});
