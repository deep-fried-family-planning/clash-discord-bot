import type {Embed, Snowflake, TextInput} from 'dfx/types';
import type {DServer} from '#src/dynamo/discord-server.ts';
import type {DUser} from '#src/dynamo/discord-user.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {MadeButton} from '#src/discord/ixc/components/make-button.ts';
import type {Route} from '#src/discord/ixc/store/id-routes.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {MadeSelect} from '#src/discord/ixc/components/make-select.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import type {IxDm} from '#src/discord/util/discord.ts';


export type IxState = {
    original: IxD;

    server_id : Snowflake;
    user_id   : Snowflake;
    user_roles: Snowflake[];
    server?   : DServer | undefined;
    user?     : DUser | undefined;

    title?      : str;
    description?: str;
    info?       : Embed | und;
    select?     : Embed | und;
    status?     : Embed | und;
    error?      : Embed | und;
    debug?      : Embed | und;

    cmap?: Record<string, Maybe<ComponentMapItem>>;

    editor?: Embed | und;

    navigate?: MadeSelect | undefined;
    row1?    : (MadeButton | und)[];
    sel1?    : MadeSelect | und;
    row2?    : (MadeButton | und)[];
    sel2?    : MadeSelect | und;
    row3?    : (MadeButton | und)[];
    sel3?    : MadeSelect | und;
    start?   : MadeSelect | undefined;
    back?    : MadeButton | undefined;
    submit?  : MadeButton | undefined;
    next?    : MadeButton | undefined;
    forward? : MadeButton | undefined;
    close?   : MadeButton | undefined;
};


export type IxAction = {
    id      : Route;
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
    MODAL_OPEN = 'MODAL_OPEN',
    MODAL_SUBMIT = 'MODAL_SUBMIT',
    MODAL_OPEN_FORWARD = 'MODAL_OPEN_FORWARD',
    MODAL_SUBMIT_FORWARD = 'MODAL_SUBMIT_FORWARD',
    MODAL_TRANSMITTER = 'MODAL_TRANSMITTER',
    TEXT = 'TEXT',
    ADMIN = 'ADMIN',
    ENTRY = 'ENTRY',
    INIT = 'INIT',
    OPEN = 'OPEN',
    EDIT = 'EDIT',
    CREATE = 'CREATE',
    FIRST = 'FIRST',
    START = 'START',
    UPDATE = 'UPDATE',
    FILTER = 'FILTER',
    BACK = 'BACK',
    NEXT = 'NEXT',
    FORWARD = 'FORWARD',
    CLOSE = 'CLOSE',
    SUBMIT = 'SUBMIT',
    DELETE = 'DELETE',
    SELECT = 'SELECT',
    NAV = 'NAV',
    NOOP = 'NOOP',
}

