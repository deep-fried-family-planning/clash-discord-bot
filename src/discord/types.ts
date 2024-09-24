/* eslint-disable @stylistic/indent */
import type {
    APIApplicationCommandAutocompleteInteraction,
    APIApplicationCommandInteraction,
    APIApplicationCommand,
    APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType,
    RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIChatInputApplicationCommandsJSONBody,
    APIApplicationCommandOption,
    APIApplicationCommandBasicOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandSubcommandOption,
    APIApplicationCommandInteractionDataBasicOption,
    APIChatInputApplicationCommandInteraction, APIEmbed,
} from 'discord-api-types/v10';

// Utils
type Override<T, K extends string, O> = Omit<T, K> & {[k in K]: O};
export type OverrideOptions<T, O> = Omit<T, 'options'> & {options: O};
type KV<V> = Record<string, V>;

// Aliases

export type Interaction = APIApplicationCommandInteraction;

type DiscordInteraction =
    | APIApplicationCommandAutocompleteInteraction
    | APIApplicationCommandInteraction;

type CmdGroup = ApplicationCommandOptionType.SubcommandGroup;
type SubCmd = ApplicationCommandOptionType.Subcommand;

type GetOptionData<T extends ApplicationCommandOptionType> = Extract<APIApplicationCommandInteractionDataOption, {type: T}>;

type DataOption = APIApplicationCommandInteractionDataOption;
type DataBasic = APIApplicationCommandInteractionDataBasicOption;
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
        [k in keyof T]: GetOptionData<T[k]['type']>
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
