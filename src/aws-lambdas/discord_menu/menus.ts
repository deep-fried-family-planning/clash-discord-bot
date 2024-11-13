import * as LinksMenu from '#src/aws-lambdas/discord_menu/menus/links.ts';
import {EntryLinks} from '#src/aws-lambdas/discord_menu/entry.ts';

export const MENUS = [
    EntryLinks,
    LinksMenu.EditQuietEnd,
    LinksMenu.EditQuietStart,
    LinksMenu.EditTimezone,
    LinksMenu.ManageAccounts,
    LinksMenu.ManageUser,
    LinksMenu.ModalLinkAccount,
    LinksMenu.SelectAccount,
    LinksMenu.LinkAccountStart,
    LinksMenu.RefreshAccounts,
] as const;
