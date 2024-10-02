import type {DiscordEmbed, DiscordMessage} from '#src/discord/types.ts';
import {MSG} from './re-exports';

export const rEmbed = (...embeds: DiscordEmbed[]): DiscordMessage => ({
    embeds,
});

type RN = {
    embeds: DiscordEmbed[];
    flags : MSG;
};

export const rEphemeralEmbed = (...embeds: DiscordEmbed[]): RN => ({
    flags: MSG.Ephemeral,
    embeds,
});
