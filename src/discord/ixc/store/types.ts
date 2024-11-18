import type {IxRE} from '#src/discord/util/discord.ts';
import type {IxD, IxDc} from '#src/discord/util/discord.ts';
import type {Embed, SelectMenu, Snowflake} from 'dfx/types';
import type {DServer} from '#src/dynamo/discord-server.ts';
import type {DUser} from '#src/dynamo/discord-user.ts';
import type {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {MadeButton, MadeSelect} from '#src/discord/ixc/components/make-components.ts';
import type {Route} from '#src/discord/ixc/store/id-routes.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */


export type BaseCustomId = string;
export type ViewName = string;


export type IxDcAction = {
    predicate: str;
    id       : Route;
    selected : {
        type : str;
        value: str;
    }[];
    forward?: str | undefined;
};


/**
 * @summary Redux Kind (RDXK)
 */
export const enum RDXK {
    MODAL = 'M',

    ENTRY = 'ENTRY',

    FIRST = 'FIRST',

    EDIT = 'EDIT',
    START = 'START',
    UPDATE = 'UPDATE',

    BUTTON = 'B',
    BACK = 'BACK',
    NEXT = 'NEXT',
    FORWARD = 'FORWARD',
    CLOSE = 'CLOSE',
    SUBMIT = 'SUBMIT',

    SELECT = 'S',
    NAV = 'NAV',
    SELECT_SINGLE = 'SS',
    NOOP = 'NOOP',
}


/**
 * @summary Redux Type (RDXT)
 */
export const enum RDXT {
    LINKS = 'LINKS',
    NEW_LINK = 'NEW_LINK',
    ACCOUNTS = 'ACCOUNTS',
    DELETE_ACCOUNT = 'DELETE_ACCOUNT',
    ACCOUNT_TYPE = 'ACCOUNT_TYPE',
    USER = 'USER',
    TIMEZONE = 'TIMEZONE',
    INFO = 'INFO',
    ROSTER = 'ROSTER',

    CLOSE = 'CLOSE',
    BACK = 'BACK',
    NEXT = 'NEXT',
    FORWARD = 'FORWARD',
    SUBMIT = 'SUBMIT',
    NAV = 'NAV',

    NOOP = 'NOOP',
    NOOP1 = 'NOOP1',
    NOOP2 = 'NOOP2',
    NOOP3 = 'NOOP3',

    FIRST_USER = 'FU',
    FIRST_UPDATE_TIMEZONE = 'FUTZ',
    FIRST_UPDATE_QUIET_START = 'FUQS',
    FIRST_UPDATE_QUIET_END = 'FUQE',
    FIRST_USER_SUBMIT = 'FUS',
    FIRST_ACCOUNT = 'FIRST_ACCOUNT',
}


export type IxDcState = {
    server_id : Snowflake;
    user_id   : Snowflake;
    user_roles: Snowflake[];
    server    : DServer;
    user      : DUser;

    previous  : {
        embeds: Embed[];
    };

    componentMap: Record<string, Maybe<ComponentMapItem>>;

    view?: {
        info?     : Embed | undefined;
        selected? : Embed | undefined;
        status?   : Embed | undefined;
        navigator?: MadeSelect | undefined;
        rows?     : (MadeButton | MadeSelect)[][];
        back?     : MadeButton | undefined;
        submit?   : MadeButton | undefined;
        next?     : MadeButton | undefined;
        forward?  : MadeButton | undefined;
        close?    : MadeButton | undefined;
    };
    // selected_player_tag: string;
    // players            : {}[];
    // selected_clan_tag  : string;
    // clans              : {}[];
    // selected_timezone  : string;
    // timezones          : {}[];
};


export type IxDcUbiquitousButtonData = {
    type   : string;
    pointer: string;
};


export type IxDcButtonData = {
    type  : string;
    value : string;
    values: string[];

    // ACC:S|user_id-1234556|ptag-#1234
    // ACC:NEW:S|user_id-1234556|ptag-#1234
};


export type IxDcSelectData = {
    original: SelectMenu;
};


export type IxDeriveState = (ix: IxD, d: IxDc) => E.Effect<IxDcState, any, any>;
export type IxDeriveAction = (ix: IxD, d: IxDc) => E.Effect<IxDcAction, any, any>;
export type IxReducer = (s: IxDcState, a: IxDcAction) => E.Effect<IxDcState, any, any>;
export type IxDispatch = (s: IxDcState, a: IxDcAction) => E.Effect<IxRE, any, any>;


