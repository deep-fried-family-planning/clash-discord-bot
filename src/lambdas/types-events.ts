import type {SQSRecord} from 'aws-lambda';
import type {APIApplicationCommandInteraction} from 'discord-api-types/v10';

export interface PollRecord extends Omit<SQSRecord, 'body'> {
    body: {
        clans  : string[];
        players: string[];
    };
}

export interface PollCocEvent {
    Records: PollRecord[];
}

export interface AppDiscordRecord extends Omit<SQSRecord, 'body'> {
    body: APIApplicationCommandInteraction;
}

export interface AppDiscordEvent {
    Records: AppDiscordRecord[];
}
