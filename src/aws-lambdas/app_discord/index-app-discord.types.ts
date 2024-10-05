import type {SQSRecord} from 'aws-lambda';
import type {APIChatInputApplicationCommandGuildInteraction, APIMessageComponentInteraction, APIModalSubmitInteraction} from '@discordjs/core/http-only';

export interface AppDiscordRecord extends Omit<SQSRecord, 'body'> {
    body: APIChatInputApplicationCommandGuildInteraction | APIMessageComponentInteraction | APIModalSubmitInteraction;
}

export interface AppDiscordEvent {
    Records: AppDiscordRecord[];
}
