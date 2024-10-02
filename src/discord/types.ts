/* eslint-disable @stylistic/indent */
import type {
    APIApplicationCommandBasicOption,
    APIApplicationCommandInteraction, APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandSubcommandOption,
    APIEmbed, APIInteractionResponseCallbackData,
    ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody, APIModalInteractionResponseCallbackData,
} from '@discordjs/core';
import type {Just} from '#src/pure/types.ts';

// Utils
type Override<T, K extends string, O> = Omit<T, K> & {[k in K]: O};
export type OverrideOptions<T, O> = Omit<T, 'options'> & {options: O};
type KV<V> = Record<string, V>;

// Aliases
export type Interaction = APIApplicationCommandInteraction;
type GetOptionData<T extends ApplicationCommandOptionType> = Extract<APIApplicationCommandInteractionDataOption, {type: T}>;
type DataSubGroup = APIApplicationCommandInteractionDataBasicOption;
type DataSubCmd = APIApplicationCommandInteractionDataBasicOption;

//
// Spec types
//
type SpecOptionBasic = APIApplicationCommandBasicOption;
type SpecOptionSubGroup = APIApplicationCommandSubcommandGroupOption;
type SpecOptionSubCmd = APIApplicationCommandSubcommandOption;

export type CommandSpec = OverrideOptions<RESTPostAPIChatInputApplicationCommandsJSONBody, Record<string,
    SpecOptionBasic
    | SubCommandSpec
    | SubGroupSpec
>>;

export type SubGroupSpec = OverrideOptions<SpecOptionSubGroup, Record<string, SubCommandSpec>>;

export type SubCommandSpec = OverrideOptions<SpecOptionSubCmd, Record<string, SpecOptionBasic>>;

//
// Data
//
type OptionData<T extends CommandSpec['options']>
    = T extends KV<SpecOptionBasic> ? {
        [k in keyof T]: T[k] extends {required: true} ? GetOptionData<T[k]['type']> : (GetOptionData<T[k]['type']> | undefined);
    }
    : T extends KV<SpecOptionSubCmd> ? {
        [k in keyof T]: OverrideOptions<DataSubCmd, OptionData<T[k]['options']>>
    }
    : T extends KV<SpecOptionSubCmd> ? {
        [k in keyof T]: OverrideOptions<DataSubGroup, OptionData<T[k]['options']>>
    }
    : never;

export type CommandData<T extends CommandSpec | SubCommandSpec> = Override<Interaction, 'data', Interaction['data'] & OverrideOptions<Interaction['data'], OptionData<T['options']>>>;

//
// Output
//
export type EmbedSpec =
    & Omit<APIEmbed, 'description' | 'footer'>
    & {
    desc   : string[];
    footer?: string[];
};

export type DiscordMessage = APIInteractionResponseCallbackData | APIModalInteractionResponseCallbackData;
export type DiscordMsg = APIInteractionResponseCallbackData;
export type DiscordModal = APIModalInteractionResponseCallbackData;
export type DiscordEmbed = APIEmbed;

export type DiscordComponent = Just<DiscordMessage['components']>;
