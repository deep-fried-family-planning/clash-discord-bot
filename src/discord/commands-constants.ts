import {ApplicationCommandOptionType} from 'discord-api-types/v10';

export const CmdOption = ApplicationCommandOptionType;

export const BASIC_OPTIONS = [
    CmdOption.String,
    CmdOption.Integer,
    CmdOption.Boolean,
    CmdOption.User,
    CmdOption.Channel,
    CmdOption.Role,
    CmdOption.Mentionable,
    CmdOption.Number,
    CmdOption.Attachment,
];

export const GROUP_OPTION = CmdOption.SubcommandGroup;
export const SUBCMD_OPTION = CmdOption.Subcommand;
