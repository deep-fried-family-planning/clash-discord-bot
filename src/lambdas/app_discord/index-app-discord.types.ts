import type {SQSRecord} from 'aws-lambda';
import type {APIApplicationCommandInteraction} from 'discord-api-types/v10';

export interface AppDiscordRecord extends Omit<SQSRecord, 'body'> {
    body: APIApplicationCommandInteraction;
}

export interface AppDiscordEvent {
    Records: AppDiscordRecord[];
}
