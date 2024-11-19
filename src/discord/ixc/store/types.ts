import type {Embed, Snowflake, TextInput} from 'dfx/types';
import type {DServer} from '#src/dynamo/discord-server.ts';
import type {DUser} from '#src/dynamo/discord-user.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {MadeButton} from '#src/discord/ixc/components/make-button.ts';
import type {Route} from '#src/discord/ixc/store/id-routes.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {MadeSelect} from '#src/discord/ixc/components/make-select.ts';
import type {IxDm} from '#src/discord/util/discord.ts';
import type {MadeText} from '#src/discord/ixc/components/make-text.ts';


export type IxState = {
    server_id : Snowflake;
    user_id   : Snowflake;
    user_roles: Snowflake[];
    server?   : DServer | undefined;
    user?     : DUser | undefined;

    title? : str;
    info?  : Embed | und;
    select?: Embed | und;
    status?: Embed | und;
    error? : Embed | und;
    debug? : Embed | und;

    cmap: Record<string, Maybe<ComponentMapItem>>;

    navigate?: MadeSelect | undefined;
    row1?    : (MadeButton | MadeSelect)[][];
    row2?    : (MadeButton | MadeSelect)[][];
    row3?    : (MadeButton | MadeSelect)[][];
    start?   : MadeSelect | undefined;
    back?    : MadeButton | undefined;
    submit?  : MadeButton | undefined;
    next?    : MadeButton | undefined;
    close?   : MadeButton | undefined;

    view?: {
        info?    : Embed | undefined;
        selected?: Embed | undefined;
        status?  : Embed | undefined;


        navigator?: MadeSelect | undefined;
        rows?     : (MadeButton | MadeSelect | MadeText | undefined)[][];
        back?     : MadeButton | undefined;
        submit?   : MadeButton | undefined;
        next?     : MadeButton | undefined;
        forward?  : MadeButton | undefined;
        close?    : MadeButton | undefined;
    };
};


export type IxAction = {
    predicate: str;
    id       : Route;
    selected : {
        type : str;
        value: str;
    }[];
    forward?: str | undefined;
    original: IxDm;
    cmap?   : Record<string, Maybe<ComponentMapItem<TextInput>>> | undefined;
};


/**
 * @summary Redux Kind (RDXK)
 */
export const enum RDXK {
    MODAL_OPEN = 'MO',
    MODAL_SUBMIT = 'SM',
    TEXT = 'T',
    ADMIN = 'A',

    ENTRY = 'EN',
    OPEN = 'OP',
    EDIT = 'ED',
    CREATE = 'CR',

    FIRST = 'FR',

    START = 'ST',
    UPDATE = 'UP',
    FILTER = 'FL',

    BACK = 'BK',
    NEXT = 'NX',
    FORWARD = 'FW',
    CLOSE = 'CL',
    SUBMIT = 'SU',
    DELETE = 'DE',

    SELECT = 'SE',
    NAV = 'NV',
    NOOP = 'NP',
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
    ROSTER_ADMIN = 'ROSTER_ADMIN',
    ROSTER_JOIN = 'ROSTER_JOIN',

    OPEN = 'OPEN',

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

    CLAN = 'CLAN',

    FIRST_USER = 'FU',
    FIRST_UPDATE_TIMEZONE = 'FUTZ',
    FIRST_UPDATE_QUIET_START = 'FUQS',
    FIRST_UPDATE_QUIET_END = 'FUQE',
    FIRST_USER_SUBMIT = 'FUS',
    FIRST_ACCOUNT = 'FA',

    TAG = 'TAG',
    API = 'API',
}


